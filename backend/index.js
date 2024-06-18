import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { getJson } from 'serpapi';


// Load environment variables from .env file
dotenv.config();
const awsSecretKey = process.env.AWS_SECRET_KEY;
const accessKey = process.env.ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;
const serpapiKey = process.env.SERPAPI_KEY;

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
        console.log("req.body", req.body);
        console.log("req.file", req.file);

        const file = req.file;
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

        console.log("saved file to temp");

        // Run the Python script to remove the background
        const pythonScriptPath = path.join(process.cwd(), 'background_removal.py');
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

        outputPath = outputPath.trim(); // Remove any trailing newline characters
        console.log(`Output path from Python script: ${outputPath}`);

        // Read the processed image file
        const processedFileBuffer = fs.readFileSync(outputPath);
        const uniqueOriginalName = uuidv4() + '-' + path.basename(tempFilePath);
        const uniqueProcessedName = uuidv4() + '-' + path.basename(outputPath);

        // Prepare for AWS upload
        const originalParams = {
            Bucket: bucketName,
            Key: uniqueOriginalName,
            Body: fs.readFileSync(tempFilePath),
            ContentType: file.mimetype,
        };

        const processedParams = {
            Bucket: bucketName,
            Key: uniqueProcessedName,
            Body: processedFileBuffer,
            ContentType: 'image/png', 
        };

        console.log('about to put processed file');

        try {
            // Upload original file
            const originalS3Response = await s3.send(new PutObjectCommand(originalParams));
            console.log('Original image uploaded:', originalS3Response);

            // Upload processed file
            const processedS3Response = await s3.send(new PutObjectCommand(processedParams));
            console.log('Processed image uploaded:', processedS3Response);

            // URL-encode the file names
            const originalImageUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(uniqueOriginalName)}`;
            const processedImageUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(uniqueProcessedName)}`;

            console.log('Original S3 link:', originalImageUrl);
            console.log('Processed S3 link:', processedImageUrl);

            // Clean up the temporary files
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(outputPath);

            res.status(200).send({ originalImageUrl, processedImageUrl });
            console.log('Sent URLs');


            /*
            *   Use Serp Api to get search results
            */



            getJson({
              engine: "google_lens",
              url: originalImageUrl,
              api_key: serpapiKey
            }, (json) => {
              console.log(json["visual_matches"]);
            });


            

            
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
