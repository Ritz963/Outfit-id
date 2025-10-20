// routes/auth.js
import express from 'express';
import { auth, db } from '../config/firebase.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password, displayName: name });

    // 1) create user document
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({ email, name, createdAt: new Date() });

    // 2) seed Main closet
    await db
      .collection('users')
      .doc(userRecord.uid)
      .collection('closets')
      .doc('Main')
      .set({ createdAt: new Date() });

    res.status(201).json({ uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
