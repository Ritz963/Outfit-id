import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const Upload = () => {
    const [image, setImage] = useState(null);
    const [imgUrl, setImgUrl] = useState(null);
    const [resultUrl, setResultUrl] = useState('');

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImgUrl(URL.createObjectURL(file));
            setImage(file);
        }
    };

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios({
                method: 'post',
                url: 'http://localhost:5000/upload',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResultUrl(response.data.url);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1>This is where you will upload a picture of your clothes</h1>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleUpload}>Upload</button>
            {imgUrl && <img src = {imgUrl} alt = "image preview" />}
            {resultUrl && <img src={resultUrl} alt="Processed result" />}
        </div>
    );
};

export default Upload;
