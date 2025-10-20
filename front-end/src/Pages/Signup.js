// src/pages/SignUp.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdError } from "react-icons/md";
import { IoLockClosed, IoPerson } from "react-icons/io5";
import Navigation from '../Components/Navigation';
import Cursor from '../Components/cursor';
import axios from 'axios';
import '../css/App.css';

const SignUp = () => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    new Cursor(document.querySelector('.cursor'));
  }, []);

  const signUp = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/auth/signup', {
        email,
        password,
        name
      });
      console.log('User created:', data);
      // redirect to sign-in
      navigate('/');
    } catch (err) {
      console.error("Signup error:", err);
      // backend sends { error: msg }
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='Signup'>

      <svg className="cursor" width="80" height="80" viewBox="0 0 80 80">
        <circle className="cursor__inner" cx="40" cy="40" r="20" />
      </svg>

      <div className='center-wrapper'>
        <div className='wrapper'>
          <form onSubmit={signUp}>
            <h1>Create Account</h1>
            {error && (
              <div className='error'>
                <MdError className='icon' />
                <p>{error}</p>
              </div>
            )}

            <div className="input-box">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='First Name'
                required
              />
              <IoPerson className='icon' />
            </div>

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

            <div className="input-box">
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder='Confirm Password'
                required
              />
              <IoLockClosed className='icon' />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>

            <div className="register-link">
              <p>
                Already have an account?{' '}
                <a href="/">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source
          src={require('../assets/background-video1.mp4')}
          type="video/mp4"
        />
      </video>
    </div>
  );
};

export default SignUp;
