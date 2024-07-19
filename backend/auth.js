import express from 'express';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(userCredential);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            name: name,
            createdAt: new Date()
        });

        res.status(201).send({ message: 'User created successfully', user: userCredential.user });
    } catch (error) {
        console.error("Caught error:", error);
        res.status(400).send({ error: error.message || "Error creating account" });
    }
});

export default router;