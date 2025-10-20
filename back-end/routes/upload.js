import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../helpers/s3Client.js';
import { removeBackground } from '../helpers/backgroundRemoval.js';
import { reverseImageSearch } from '../helpers/serpapi.js';
import { extractClothingType, extractBrand, extractColor, categorizeClothing } from '../helpers/clothingHelpers.js';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { userId, closetName } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image provided' });

    // Save temp file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempPath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempPath, file.buffer);

    // Remove background via Python script
    const pythonExe = os.platform() === 'win32' ? 'python' : 'python3';
    const script = path.join(process.cwd(), 'background_removal.py');
    const output = await removeBackground(pythonExe, script, tempPath);

    const processedBuffer = fs.readFileSync(output);
    const originalKey = `uploads/${uuidv4()}-${file.originalname}`;
    const processedKey = `uploads/${uuidv4()}-${path.basename(output)}`;

    // Upload to S3
    const originalUrl = await uploadToS3(file.buffer, originalKey, file.mimetype);
    const processedUrl = await uploadToS3(processedBuffer, processedKey, 'image/png');

    // Clean up temp
    fs.unlinkSync(tempPath);
    fs.unlinkSync(output);

    // Reverse image search
    const matches = await reverseImageSearch(originalUrl);
    const titles = matches.slice(0,5).map(m => m.title);

    // Extract metadata
    const clothingType = extractClothingType(titles);
    const category = categorizeClothing(clothingType);
    const brand = extractBrand(titles);
    const color = extractColor(titles);

    // Save to Firestore
    const userRef = doc(db, 'users', userId);
    const closetRef = collection(userRef, 'closets');
    const specificCloset = doc(closetRef, closetName);
    const categoryCol = collection(specificCloset, category);
    const itemRef = doc(categoryCol, uuidv4());
    await setDoc(itemRef, { brand, color, imageUrl: processedUrl, type: clothingType, createdAt: new Date() });

    res.json({ originalUrl, processedUrl, clothingType, brand, color, titles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;