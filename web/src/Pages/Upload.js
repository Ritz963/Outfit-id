import React, {useState} from "react";
// import axios from 'axios';
import '../App.css';

const Upload  = () => {
    const [image, setImage] = useState(null);
    const [show, showImg] = useState();


    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
        showImg(URL.createObjectURL(event.target.files[0]));
    };

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);
            // Handle the response as needed
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1>
                This is where you will uplaod a picture of your clothes
            </h1>
            <input type = "file" accept="image/*" onChange={handleImageChange}/>
            <button onClick={handleUpload}>Upload</button>
            <img src = {show} alt = "preview"/>
        </div>
    )
};

export default Upload;
