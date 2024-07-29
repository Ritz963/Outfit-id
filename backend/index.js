import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { getJson } from 'serpapi';
import authRoutes from './auth.js';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase.js';
import os from 'os';


// Load environment variables from .env file
dotenv.config();
const awsSecretKey = process.env.AWS_SECRET_KEY;
const accessKey = process.env.ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;
const serpapiKey = process.env.SERPAPI_KEY;

const clothingTypes = [
    "shirt", "pants", "dress", "skirt", "jacket", "coat", "sweater", "t-shirt",
    "jeans", "shorts", "blouse", "suit", "hoodie", "scarf", "gloves", "hat",
    "cap", "shoes", "boots", "sneakers", "sneaker", "socks", "tie", "belt", "underwear", " Tee", "boost"
];

const brands = [
    "Nike", "Adidas", "Puma", "Gucci", "Prada", "Louis Vuitton", "Chanel",
    "H&M", "Zara", "Uniqlo", "Levi's", "Ralph Lauren", "Calvin Klein", "Tommy Hilfiger", "Essentials", "Gallery Dept",
    "New Balance", "Yeezy", "adidas"
    // add more later
];

const colors = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "purple", "orange",
    "gray", "brown", "beige", "gold", "silver", "navy", "maroon", "teal", "turquoise", "burgundy", "Oatmeal",
    // add more later
];

  
const extractClothingType = (titles, clothingTypes) => {
    const foundTypes = {};

    titles.forEach(title => {
        clothingTypes.forEach(type => {
            if (title.toLowerCase().includes(type.toLowerCase())) {
                foundTypes[type] = (foundTypes[type] || 0) + 1;
            }
        });
    });

    const sortedTypes = Object.entries(foundTypes).sort((a, b) => {
        if (b[1] === a[1]) {
            return clothingTypes.indexOf(a[0]) - clothingTypes.indexOf(b[0]);
        }
        return b[1] - a[1];
    });
    return sortedTypes.length > 0 ? sortedTypes[0][0] : "Unknown";
};


const extractBrand = (titles, brands) => {
    const foundBrands = {};

    titles.forEach(title => {
        brands.forEach(brand => {
        if (title.toLowerCase().includes(brand.toLowerCase())) {
            foundBrands[brand] = (foundBrands[brand] || 0) + 1;
        }
        });
    });

    const sortedBrands = Object.entries(foundBrands).sort((a, b) => b[1] - a[1]);
    return sortedBrands.length > 0 ? sortedBrands[0][0] : "Unknown";
};

const extractColor = (titles, colors) => {
    const foundColors = {};

    titles.forEach(title => {
        colors.forEach(color => {
        if (title.toLowerCase().includes(color.toLowerCase())) {
            foundColors[color] = (foundColors[color] || 0) + 1;
        }
        });
    });

    const sortedColors = Object.entries(foundColors).sort((a, b) => b[1] - a[1]);
    return sortedColors.length > 0 ? sortedColors[0][0] : "Unknown";
};

const categorizeClothing = (clothingType) => {
    const tops = ['shirt', 't-shirt', 'suit', 'hoodie', 'blouse', 'sweater', 'jacket', 'coat', 'dress', 'blouse', 'tee'];
    const bottoms = ['pants', 'jeans', 'shorts', 'skirt', 'trousers', 'leggings', 'sweatpants', 'joggers'];
    const shoes = ['shoes', 'boots', 'sneakers', 'sandals', 'sneaker', 'boost'];

    clothingType = clothingType.toLowerCase();

    if (tops.includes(clothingType)) {
        return 'tops';
    } else if (bottoms.includes(clothingType)) {
        return 'bottoms';
    } else if (shoes.includes(clothingType)) {
        return 'shoes';
    } else {
        return 'other';
    }
};




// API setup
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(process.cwd(), 'static')));

// Storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AWS S3 client setup
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: awsSecretKey,
  },
  region: 'us-east-1'
});


app.use('/auth', authRoutes);

// Receives image upload from front end
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { userId, closetName } = req.body;
        console.log("req.body", req.body);
        console.log("req.file", req.file);

        const file = req.file;
        if (!file) {
        console.log("Check if file exists");
        return res.status(400).send({ error: "No image file provided" });
        }
        console.log("after if");

        // Save the uploaded file temporarily
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, file.originalname);
        fs.writeFileSync(tempFilePath, file.buffer);

        console.log("saved file to temp");

        const pythonExecutable = os.platform() === 'win32' ? 'python' : 'python3';

        // Run the Python script to remove the background
        const pythonScriptPath = path.join(process.cwd(), 'background_removal.py');
        const python = spawn(pythonExecutable, [pythonScriptPath, tempFilePath]);

        let outputPath = '';

        python.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            outputPath += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        python.on('close', async (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) {
                return res.status(500).send({ error: 'Error removing background' });
            }

            outputPath = outputPath.trim(); // Remove any trailing newline characters
            console.log(`Output path from Python script: ${outputPath}`);

            // Read the processed image file
            const processedFileBuffer = fs.readFileSync(outputPath);
            const uniqueOriginalName = uuidv4() + '-' + path.basename(tempFilePath);
            const uniqueProcessedName = uuidv4() + '-' + path.basename(outputPath);

            // Prepare for AWS upload
            const originalParams = {
                Bucket: bucketName,
                Key: uniqueOriginalName,
                Body: fs.readFileSync(tempFilePath),
                ContentType: file.mimetype,
            };

            const processedParams = {
                Bucket: bucketName,
                Key: uniqueProcessedName,
                Body: processedFileBuffer,
                ContentType: 'image/png', 
            };

            console.log('about to put processed file');

            try {
                // Upload original file
                const originalS3Response = await s3.send(new PutObjectCommand(originalParams));
                //console.log('Original image uploaded:', originalS3Response);

                // Upload processed file
                const processedS3Response = await s3.send(new PutObjectCommand(processedParams));
                //console.log('Processed image uploaded:', processedS3Response);

                const originalImageUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(uniqueOriginalName)}`;
                const processedImageUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(uniqueProcessedName)}`;

                console.log('Original S3 link:', originalImageUrl);
                console.log('Processed S3 link:', processedImageUrl);

                // Clean up the temporary files
                fs.unlinkSync(tempFilePath);
                fs.unlinkSync(outputPath);


                console.log("about to use serpapi")

                // Use Serp Api to get search results
                getJson({
                    engine: "google_lens",
                    url: originalImageUrl,
                    api_key: serpapiKey
                }, async (json) => {
                    const visualMatches = json["visual_matches"] || [];
                    const titles = visualMatches.slice(0, 5).map(match => match.title);
        
                    // Extract clothing type, brand, and color
                    const clothingType = extractClothingType(titles, clothingTypes);
                    const category = categorizeClothing(clothingType);                    
                    const brand = extractBrand(titles, brands);
                    const color = extractColor(titles, colors);
        
                    console.log("extracted everytihgn")

                    // Save the clothing data to Firestore
                    const userRef = doc(db, 'users', userId);
                    const closetRef = collection(userRef, 'closets');
                    const specificClosetRef = doc(closetRef, closetName);
                    const categoryCollectionRef = collection(specificClosetRef, category);
                    const clothingItemRef = doc(categoryCollectionRef, uuidv4());

                    await setDoc(clothingItemRef, {
                        brand,
                        color,
                        imageUrl: processedImageUrl,
                        type: clothingType,
                        createdAt: new Date()
                    });

                    res.status(200).send({
                    originalImageUrl,
                    processedImageUrl,
                    clothingType,
                    brand,
                    color,
                    titles
                    });
                    console.log('Sent URLs, clothing type, brand, color, and titles');
                });


                
            } catch (uploadError) {
                console.error('AWS S3 upload error:', uploadError);
                res.status(500).send({ error: 'Error uploading to S3' });
            }
        });
    } catch (error) {
        console.error('Server error', error.message);
        res.status(500).send({ error: error.message });
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
