import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/App.css';
import { MdEmail } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { MdError } from "react-icons/md";
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import Cursor from '../Components/cursor';
import { preloadImages } from '../Components/utils';
import Navigation from '../Components/Navigation';
import Grid from '../Components/Grid.js';

import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';
import img4 from '../assets/img4.png';
import img5 from '../assets/img5.png';
import img6 from '../assets/img6.png';
import img7 from '../assets/img7.png';
import img8 from '../assets/img8.png';
import img9 from '../assets/img9.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const gridRef = useRef(null);

    useEffect(() => {
        if (gridRef.current) {
            new Grid(gridRef.current);
        }

        const cursor = new Cursor(document.querySelector('.cursor'));

        // Preload images
        preloadImages('.grid__item-img').then(() => {
            // Remove loader (loading class)
            document.body.classList.remove('loading');
            
            // Initialize grid
            if (gridRef.current) {
                new Grid(gridRef.current);
            }
        });
    }, []);

    const signIn = async (event) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
            navigate('/home');
        })
        .catch((error) => {
            console.error("Caught error:", error);
            setError(error.message || "Error creating account");
        })
    };

  return (
    
    <div className='login'>
        <Navigation/>

        <svg className="cursor" width="80" height="80" viewBox="0 0 80 80">
                <circle className="cursor__inner" cx="40" cy="40" r="20" />
        </svg>
        
        <div className="content">
            <div className="grid" ref={gridRef}>
                <div className="grid__item pos-1"><div className="grid__item-img" style={{backgroundImage: `url(${img1})`}}></div></div>
                <div className="grid__item pos-2"><div className="grid__item-img" style={{backgroundImage: `url(${img2})`}}></div></div>
                <div className="grid__item pos-3"><div className="grid__item-img" style={{backgroundImage: `url(${img3})`}}></div></div>
                <div className="grid__item pos-4"><div className="grid__item-img" style={{backgroundImage: `url(${img4})`}}></div></div>
                <div className="grid__item pos-5"><div className="grid__item-img" style={{backgroundImage: `url(${img5})`}}></div></div>
                <div className="grid__item pos-6"><div className="grid__item-img" style={{backgroundImage: `url(${img6})`}}></div></div>
                <div className="grid__item pos-7"><div className="grid__item-img" style={{backgroundImage: `url(${img7})`}}></div></div>
                <div className="grid__item pos-8"><div className="grid__item-img" style={{backgroundImage: `url(${img8})`}}></div></div>
                <div className="grid__item pos-9"><div className="grid__item-img" style={{backgroundImage: `url(${img9})`}}></div></div>
            </div>
        </div>


        <div className='center-wrapper'>
        <div className='wrapper'>
            <form onSubmit={signIn}>
                <h1>Login</h1>
                {error && <div className = 'error'><MdError className='icon'/><p>{error}</p></div>}
                <div className="input-box">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
                    <MdEmail className='icon' />
                </div>

                <div className="input-box">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
                    <IoLockClosed className='icon' />
                </div>

                <div className="remember-forgot">
                    <label> <input type="checkbox" /> Remember me </label>
                    <a href="#">Forgot password</a>
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="./signup">Register</a></p>
                </div>
                
            </form>
        </div>
        </div>
    </div>
  );
};

export default Login;
