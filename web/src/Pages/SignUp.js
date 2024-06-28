import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import { MdError } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import Navigation from '../Components/Navigation';
import '../css/App.css';



const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const signUp = async (event) => {
        event.preventDefault();

        if (password !== confirmPass) {
            setError("Passwords do not match");
            return;
        }
        
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
            navigate('/');
        })
        .catch((error) => {
            console.error("Caught error:", error);
            setError(error.message || "Error creating account");
        })
    };

  return (
    <div className='login'>
        <Navigation/>
            <div className='center-wrapper'>
        <div className='wrapper'>
            <form onSubmit={signUp}>
                <h1>Create Acccount</h1>
                {error && <div className = 'error'><MdError className='icon'/><p>{error}</p></div>}
                <div className="input-box">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
                    <MdEmail className='icon' />
                </div>

                <div className="input-box">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
                    <IoLockClosed className='icon' />
                </div>

                <div className ="input-box">
                    <input type = "password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder = 'Confirm Password' required />
                    <IoLockClosed className='icon' />
                </div>

                <button type="submit">Create Account</button>

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
