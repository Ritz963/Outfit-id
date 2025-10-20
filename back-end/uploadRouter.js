// uploadRouter.js
import express from 'express';
import multer from 'multer';
import { uploadBufferToS3 } from './routes/upload.js';       // your S3 helper
// import { reverseImageSearch } from './serpApi.js';   // your SerpAPI wrapper
// import { removeBackground } from './removeBg.js';    // your remove.bg wrapper
// import admin from 'firebase-admin';

const router = express.Router();
const upload = multer();  // in‑memory storage

router.post('/', upload.single('file'), async (req, res) => {
  try {
    // 1️⃣ Upload original to S3
    const key = `uploads/${Date.now()}_${req.file.originalname}`;
    const originalUrl = await uploadBufferToS3(req.file.buffer, key, req.file.mimetype);

    // 2️⃣ Reverse‑image search
    const visualMatches = await reverseImageSearch(originalUrl);

    // 3️⃣ Remove background
    const nobgBuffer = await removeBackground(req.file.buffer);
    const nobgKey = key.replace(/\.(png|jpe?g)$/i, '_nobg.png');
    const processedUrl = await uploadBufferToS3(nobgBuffer, nobgKey, 'image/png');

    // 4️⃣ Save metadata to Firestore
    await admin.firestore().collection('clothes').add({
      originalUrl,
      processedUrl,
      visualMatches,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5️⃣ Reply to the client
    res.json({ success: true, originalUrl, processedUrl, visualMatches });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
