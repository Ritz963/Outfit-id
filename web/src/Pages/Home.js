// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Components/Navigation';


const Home = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const loadUserData = async (uid) => {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setUserData(doc.data());
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                loadUserData(user.uid);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div>
            {userData ? (
            <div>
                <h1>Welcome, {userData.name}</h1>
                <p>Email: {userData.email}</p>
            </div>
            ) : (
            <p>Loading...</p>
            )}
        </div>
    );
};

export default Home;
