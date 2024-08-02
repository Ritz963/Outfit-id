// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_KEY,
  authDomain: "closet-id.firebaseapp.com",
  projectId: "closet-id",
  storageBucket: "closet-id.appspot.com",
  messagingSenderId: "321888727359",
  appId: "1:321888727359:web:33e738bb3a8f2bcc1ca38a",
  measurementId: "G-X5JSPPZ1N2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
