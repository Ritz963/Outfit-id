import React, { useState } from 'react';
import '../css/Login.css';
import { MdEmail } from "react-icons/md";
import { IoLockClosed } from "react-icons/io5";
import { FaLock } from "react-icons/fa";



const Login = () => {

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');


    const handleSubmit = () => {

    }


    return (
        <div className='wrapper'>
            <form action = "">
                <h1>Login</h1>
                <div className = "input-box">
                    <input type = "text" value = {email} placeholder = 'Email' required/>
                    <MdEmail className='icon'/>
                </div>

                <div className = "input-box">
                    <input type = "text" value = {pass} placeholder = 'Password' required/>
                    <IoLockClosed className='icon'/>
                </div>
                
                <div className = "remember-forgot">
                    <label> <input type = "checkbox" /> Remember me </label>
                    <a href = '#'>Forgot password</a>
                </div>

                <button type = "submit" onChange={handleSubmit}>Login</button>

                <div className = "register-link">
                    <p>Don't have an account? <a href = '#'>Register</a></p>
                </div>

            </form>
        </div>
    )


};


export default Login;