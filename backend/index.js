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

        req.file.buffer

        // // shorthands req.file to just file
        const file = req.file

        if (!file) {
            console.log("Check if file exists");
            return res.status(400).send({ error: "No image file provided" });
        }

        console.log("after if");

        // prepareing for aws upload
        const params = {
            Bucket: bucketName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        }

        console.log("about to put file")
        const command = new PutObjectCommand(params)

        console.log("sending file")
        const s3Response = await s3.send(command)
        console.log('after aws upload')

        const encodedFileName = encodeURIComponent(file.originalname);
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${encodedFileName}`;
        console.log('S3 link:', imageUrl);

        // Prepare the form data for Remove.bg
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_url', 'https://www.remove.bg/example.jpg');

        console.log('about to make request');


        // Make the request to Remove.bg
        const removeBgResponse = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responsetype: 'arraybuffer',
        headers: {
            ...formData.getHeaders(),
            'X-Api-Key': 'Xv8SkX86mZq3XjUogEF8FTdb',
        }
        });

        console.log('finished request');

        if (removeBgResponse.status !== 200) {
          console.log('Remove.bg error', removeBgResponse.status, removeBgResponse.statusText);
          return res.status(removeBgResponse.status).send({ error: removeBgResponse.statusText });
        }
    
        // Save the processed image locally
        const fileName = `${uuidv4()}.png`;
        const filePath = path.join(process.cwd(), 'static', fileName);
        fs.writeFileSync(filePath, removeBgResponse.data);
    
        const fileUrl = `http://localhost:5000/static/${fileName}`;

        console.log('saved file url', fileUrl);

        res.status(200).send({ imgurUrl: imageUrl, fileUrl: fileUrl });
        console.log('imageUrl',imageUrl );
        console.log('fileUrl', imageUrl );
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
