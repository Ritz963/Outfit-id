// src/pages/Login.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdError } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import Cursor from '../Components/cursor';
import Navigation from '../Components/Navigation';
import Grid from '../Components/Grid.js';
import { preloadImages } from '../Components/utils';
import { auth } from '../firebaseClient';                       // your client SDK init
import { signInWithEmailAndPassword } from 'firebase/auth';      // Firebase client auth
import '../css/App.css';

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
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const navigate = useNavigate();
  const gridRef  = useRef(null);

  useEffect(() => {
    // init grid & cursor
    if (gridRef.current) new Grid(gridRef.current);
    new Cursor(document.querySelector('.cursor'));

    preloadImages('.grid__item-img').then(() => {
      document.body.classList.remove('loading');
      if (gridRef.current) new Grid(gridRef.current);
    });
  }, []);

  const signIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className='login'>

      <svg className="cursor" width="80" height="80" viewBox="0 0 80 80">
        <circle className="cursor__inner" cx="40" cy="40" r="20" />
      </svg>

      <div className="content">
        <div className="grid" ref={gridRef}>
          {[img1,img2,img3,img4,img5,img6,img7,img8,img9].map((img, i) => (
            <div key={i} className={`grid__item pos-${i+1}`}>
              <div
                className="grid__item-img"
                style={{ backgroundImage: `url(${img})` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className='center-wrapper'>
        <div className='wrapper'>
          <form onSubmit={signIn}>
            <h1>Login</h1>
            {error && (
              <div className='error'>
                <MdError className='icon'/>
                <p>{error}</p>
              </div>
            )}

            <div className="input-box">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Email'
                required
              />
              <MdEmail className='icon' />
            </div>

            <div className="input-box">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Password'
                required
              />
              <IoLockClosed className='icon' />
            </div>

            <div className="remember-forgot">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password</a>
            </div>

            <button type="submit">Login</button>

            <div className="register-link">
              <p>
                Don't have an account?{' '}
                <a href="/signup">Register</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
