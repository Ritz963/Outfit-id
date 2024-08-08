import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdError } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import Navigation from '../Components/Navigation';
import '../css/App.css';
import axios from 'axios';



const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const signUp = async (event) => {
        event.preventDefault();

        if (password !== confirmPass) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:3001/auth/signup', {
                email,
                password,
                name
            });
            console.log(response.data);
            navigate('/');
        } catch (error) {
            console.error("Caught error:", error);
            setError(error.response?.data?.error || "Error creating account");
        }
    };

  return (
    <div className='Signup'>
        <Navigation/>
            <div className='center-wrapper'>
        <div className='wrapper'>
            <form onSubmit={signUp}>
                <h1>Create Acccount</h1>
                {error && <div className = 'error'><MdError className='icon'/><p>{error}</p></div>}

                <div className="input-box">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='First Name' required />
                    <IoPerson className='icon' />
                </div>

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
                    <p>Already have an account? <a href="./">Sign in</a></p>
                </div>
                
            </form>
        </div>
        </div>
    </div>
  );
};

export default SignUp;
