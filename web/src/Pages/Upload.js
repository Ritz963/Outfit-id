import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import '../css/App.css';
import Navigation from '../Components/Navigation';

const Upload = () => {
    const [image, setImage] = useState(null);
    const [imgUrl, setImgUrl] = useState(null);
    const [resultUrl, setResultUrl] = useState('');
    const [clothingType, setClothingType] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [titles, setTitles] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImgUrl(URL.createObjectURL(file));
            setImage(file);
        }
    };

    const handleUpload = async () => {
        if (!image || !userId) return;

        const formData = new FormData();
        formData.append('image', image);
        formData.append('userId', userId);
        formData.append('closetName', 'Main');
        console.log('gonna upload')

        try {
            const response = await axios({
                method: 'post',
                url: 'http://localhost:3001/upload',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResultUrl(response.data.processedImageUrl);
            setClothingType(response.data.clothingType);
            setBrand(response.data.brand);
            setColor(response.data.color);
            setTitles(response.data.titles);
            console.log(response.data.processedImageUrl);
            console.log(response.data.titles)
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'An error occurred while uploading the image.');
        }
    };

    return (
        <div className='upload'>
            <Navigation />
            <div>
                {error && <p>{error}</p>}
                <h1>This is where you will upload a picture of your clothes</h1>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <button onClick={handleUpload}>Upload</button>
                {imgUrl && <img src={imgUrl} alt="background remove preview" style={{ width: '300px', height: '300px' }} />}
                {resultUrl && <h2>Here is the processed image</h2>}
                {resultUrl && <img src={resultUrl} alt="Processed result" style={{ width: '300px', height: '300px' }} />}
                {clothingType && <h2>Detected Clothing Type: {clothingType}</h2>}
                {brand && <h2>Detected Brand: {brand}</h2>}
                {color && <h2>Detected Color: {color}</h2>}
                {titles.length > 0 && <h2>First 5 Titles from Google Lens:</h2>}
                <ul>
                    {titles.map((title, index) => (
                        <li key={index}>{title}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Upload;
