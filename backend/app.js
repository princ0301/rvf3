const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());
const port = 3000; // Change to your preferred port

// Replace with the actual URL of your Flask API endpoint
const flaskApiUrl = 'http://localhost:5000/predict'; // Adjust for deployment

// Multer storage configuration (optional)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename (or customize as needed)
  }
});

// Create multer upload middleware
const upload = multer({ storage: storage });

// Function to send image file to Flask API and handle response
const sendImageToFlask = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath)); // Load image using fs

    const response = await axios.post(flaskApiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending image to Flask API:', error);
    return { error: 'Failed to process image' };
  }
};

// Route to handle image upload and prediction
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const filePath = req.file.path;

  try {
    // Send image to Flask API and get prediction
    const prediction = await sendImageToFlask(filePath);

    // Clean up temporary image (optional if using multer)
    // fs.unlinkSync(filePath); // Uncomment if you want to delete the uploaded file

    res.json(prediction);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Node.js backend listening on port ${port}`);
});