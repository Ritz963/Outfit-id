// File: server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import os from 'os';
import { spawn } from 'child_process';
import { getJson } from 'serpapi';
import authRoutes from './routes/auth.js';
import { db } from './config/firebase.js';  

import {
  extractClothingType,
  extractBrand,
  extractColor,
  categorizeClothing
} from './helpers/clothingHelpers.js';

dotenv.config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  BUCKET_NAME,
  SERPAPI_KEY
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(process.cwd(), 'static')));
app.use('/auth', authRoutes);

// Multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  console.log('received upload request');
  try {
    const { userId, closetName } = req.body;
    const file = req.file;
    if (!file || !userId || !closetName) {
      return res.status(400).json({ error: 'Missing image, userId, or closetName' });
    }

    //save the file to temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempPath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempPath, file.buffer);
    console.log('saved temp file');

    //remove background with pythogn script
    const pythonExe = os.platform() === 'win32' ? 'python' : 'python3';
    const py = spawn(pythonExe, [path.join(process.cwd(), 'background_removal.py'), tempPath]);
    let output = '';
    py.stdout.on('data', data => { output += data.toString(); });
    py.stderr.on('data', data => console.error('Python error:', data.toString()));

    py.on('close', async code => {
      if (code !== 0) return res.status(500).json({ error: 'Background removal failed' });
      const processedPath = output.trim();
      const processedBuffer = fs.readFileSync(processedPath);
      console.log('background removed');

      
      const originalKey = `uploads/${uuidv4()}-${file.originalname}`;
      const processedKey = `uploads/${uuidv4()}-${path.basename(processedPath)}`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalKey,
        Body: fs.readFileSync(tempPath),
        ContentType: file.mimetype,
      }));

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: processedKey,
        Body: processedBuffer,
        ContentType: 'image/png',
      }));

      //Get image URLs
      const originalUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/` + originalKey.split('/').map(encodeURIComponent).join('/');
      const processedUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/` + processedKey.split('/').map(encodeURIComponent).join('/'); 
      console.log('uploaded to S3', originalUrl);

      let titles = [];
      try {
        //Get reverse image search results
        const response = await new Promise((resolve, reject) => {
          getJson({
            engine:        'google_reverse_image',
            image_url:     originalUrl,   
            api_key:       SERPAPI_KEY
          }, (data, err) => err ? reject(err) : resolve(data));
        });
      
        //Looks at top 8 results
        const results = response.image_results || [];
        titles = results.slice(0, 8).map(r => r.title);
        console.log('reverse image search complete', titles);

      } catch (searchErr) {
        console.error('SerpAPI search error:', searchErr);
      }

      const clothingType = extractClothingType(titles);
      const category = categorizeClothing(clothingType);
      const brand = extractBrand(titles);
      const color = extractColor(titles);
      console.log('metadata extracted');

      const userDoc = db.collection('users').doc(userId);
      const closetDoc = userDoc.collection('closets').doc(closetName);
      const categoryCollection = closetDoc.collection(category);
      const itemDoc = categoryCollection.doc(uuidv4());
      await itemDoc.set({ brand, color, imageUrl: processedUrl, type: clothingType, createdAt: new Date() });
      console.log('metadata saved to Firestore');

      //delete temp files
      fs.unlinkSync(tempPath);
      fs.unlinkSync(processedPath);

      res.json({ originalUrl, processedUrl, clothingType, brand, color, titles });
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
