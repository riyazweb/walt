const { Storage } = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

console.log('Starting server initialization...');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Initialize Storage
console.log('Initializing Google Cloud Storage...');
const storageOptions = {};
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.NODE_ENV !== 'production') {
  storageOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('Using local credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  console.log('Using default Google Cloud credentials (ADC)');
}

let storage;
let bucket;
const bucketName = 'waltbuck1';

try {
  storage = new Storage(storageOptions); 
  bucket = storage.bucket(bucketName);
  console.log(`Connected to bucket: ${bucketName}`);
} catch (err) {
  console.error('Failed to initialize Storage:', err);
}

// Multer setup for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Serve static files from the React app
const distPath = path.join(__dirname, '../dist');
console.log(`Checking for static files at: ${distPath}`);
app.use(express.static(distPath));

// GET all wallpapers
app.get('/api/wallpapers', async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const wallpaperUrls = files.map(file => ({
      name: file.name,
      url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
      metadata: file.metadata
    }));
    res.json(wallpaperUrls);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).send("Error fetching images");
  }
});

// POST upload wallpaper
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const collectionName = req.body.collectionName || 'Uncategorized';
    // Create a folder-like structure using the collection name as a prefix
    const fileName = `${collectionName}/${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(fileName);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error("Upload error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: err.message });
      }
    });

    blobStream.on('finish', async () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      
      res.status(200).send({
        message: 'Uploaded successfully',
        name: blob.name,
        url: publicUrl
      });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send({ message: err.message });
  }
});

// DELETE wallpaper
app.post('/api/delete', async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).send('No file name provided.');
    }

    await bucket.file(fileName).delete();
    res.status(200).send({ message: 'Deleted successfully' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send({ message: err.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Frontend build not found. Please ensure the build step completed successfully.');
    }
  });
});

const PORT = process.env.PORT || 8080;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Server is successfully listening on 0.0.0.0:${PORT}`);
  console.log(`>>> NODE_ENV: ${process.env.NODE_ENV}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
