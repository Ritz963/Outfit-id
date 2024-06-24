import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import '../css/Login.css';
import { MdEmail } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import Navigation from '../Components/Navigation';


const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signUp = async (event) => {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
        })
        .catch((error) => {
            console.log(error)
        })
    };

  return (
    <div className='login'>
        <Navigation/>
            <div className='center-wrapper'>
        <div className='wrapper'>
            <form onSubmit={signUp}>
                <h1>Create Acccount</h1>
                {error && <p className="error">{error}</p>}
                <div className="input-box">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
                    <MdEmail className='icon' />
                </div>

                <div className="input-box">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
                    <IoLockClosed className='icon' />
                </div>

                <div className ="input-box">
                    <input type = "password" value={confirmPass} onChange={(e) => setPassword(e.target.value)} placeholder = 'Confirm Password' required />
                    <IoLockClosed className='icon' />
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Already have an account? <a href="./Login.js">Sign in</a></p>
                </div>
                
            </form>
        </div>
        </div>
    </div>
  );
};

export default SignUp;
