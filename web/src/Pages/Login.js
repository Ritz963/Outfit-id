import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/App.css';
import { MdEmail } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { MdError } from "react-icons/md";
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import Navigation from '../Components/Navigation';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signIn = async (event) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
            navigate('/upload');
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
