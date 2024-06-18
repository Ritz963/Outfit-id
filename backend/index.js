import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { exec } from 'child_process'
import { spawn } from 'child_process'


// Load environment variables from .env file
dotenv.config();
const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
const awsSecretKey = process.env.AWS_SECRET_KEY;
const accessKey = process.env.ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;

// API setup
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(process.cwd(), 'static')));

// Storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AWS S3 client setup
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: awsSecretKey,
    },
    region: 'us-east-1'
});

// Receives image upload from front end
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log("req.body", req.body)
        console.log("req.file", req.file)


        // // shorthands req.file to just file
        const file = req.file
        if (!file) {
            console.log("Check if file exists");
            return res.status(400).send({ error: "No image file provided" });
        }
        console.log("after if");


        // Save the uploaded file temporarily
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, file.originalname);
        fs.writeFileSync(tempFilePath, file.buffer);
        console.log("saved file to temp")


        // run python child
        const pythonScriptPath = path.join(process.cwd(), 'background_removal.py');
        console.log(pythonScriptPath)
        const python = spawn('python', [pythonScriptPath, tempFilePath]);

        let outputPath = '';

        python.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            outputPath += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        python.on('close', async (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) {
              return res.status(500).send({ error: 'Error removing background' });
            }

            outputPath = outputPath.trim();
            console.log(`Output path from Python script: ${outputPath}`);
      
            // Read the processed image file
            const processedFileBuffer = fs.readFileSync(outputPath);
            const uniqueName = uuidv4() + '-' + path.basename(outputPath);
      
            // Prepare for AWS upload
            const params = {
              Bucket: bucketName,
              Key: uniqueName,
              Body: processedFileBuffer,
              ContentType: 'image/png', // Ensure this is correct
            };
            const command = new PutObjectCommand(params);
      
            console.log('about to put processed file');
      
            try {
              const s3Response = await s3.send(command);
              console.log('after aws upload');
      
              // URL-encode the file name
              const encodedFileName = encodeURIComponent(uniqueName);
              const imageUrl = `https://${bucketName}.s3.amazonaws.com/${encodedFileName}`;
              console.log('S3 link:', imageUrl);
      
              // Clean up the temporary file
              //fs.unlinkSync(tempFilePath);
      
              res.status(200).send({ imageUrl });
              console.log('sent url');
            } catch (uploadError) {
              console.error('AWS S3 upload error:', uploadError);
              res.status(500).send({ error: 'Error uploading to S3' });
            }
        });


    } catch (error) {
        console.error('Server error', error.message);
        res.status(500).send({ error: error.message });
    }


});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
