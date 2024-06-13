const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use('/static', express.static(path.join(__dirname, 'static')));

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log("received");

        const file = req.file;

        if (!file) {
            console.log("in if");

            return res.status(400).send({ error: "No image file provided" });
        }

        console.log("after if");

        // Save the file locally to work with fs.createReadStream
        const tempFilePath = path.join(__dirname, 'temp', file.originalname);
        fs.writeFileSync(tempFilePath, file.buffer);

        console.log("after temp path");


        // Prepare the form data
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', fs.createReadStream(tempFilePath), path.basename(tempFilePath));

        console.log('about to make request');

        // Make the request to Remove.bg
        const removeBgResponse = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            responseType: 'arraybuffer',
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': 'not here sorry', // Replace with API key
            }
        });

        console.log('finished request');

        if (removeBgResponse.status !== 200) {
            return res.status(removeBgResponse.status).send({ error: removeBgResponse.statusText });
        }

        // Save the processed image locally
        const fileName = `${uuidv4()}.png`;
        const filePath = path.join(__dirname, 'static', fileName);
        fs.writeFileSync(filePath, removeBgResponse.data);

        // Clean up the temp file
        fs.unlinkSync(tempFilePath);

        const fileUrl = `http://localhost:5000/static/${fileName}`;

        console.log('saved file url');

        res.status(200).send({ url: fileUrl });
        console.log('sent url');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
