import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Components/Navigation';

const TestLogin = () => {
    return(
        <div className="TestLogin">
            <Navigation />
            <h1>Test Login</h1>
            <div className="content">
                <div className = "grid">

                    <div className="grid__item pos-1"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-2"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-3"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-4"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-5"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-6"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-7"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-8"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-9"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    <div className="grid__item pos-10"><div className="grid__item-img" style={{backgroundImage: `url("../assets/smile.png")`}}></div></div>
                    
                </div>
            </div>
        </div>

    );
};

export default TestLogin