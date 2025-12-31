const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit'); // Add this
require('dotenv').config();

console.log('Starting server initialization...');

const app = express();
app.use(cors({
  origin: '*', // Allow all origins
  allowedHeaders: ['Content-Type', 'x-api-key'] // Explicitly allow your custom header
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting: Prevent bot attacks and cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

// Apply limiter to all API routes
app.use('/api/', limiter);

// API Key Middleware: 100% Safe (Header Only)
const apiKeyAuth = (req, res, next) => {
  // Express lowercases all headers, so we check for 'x-api-key'
  const providedKey = req.headers['x-api-key'];
  const secretKey = process.env.WALLPAPER_API_KEY;

  // Debug log (visible in Cloud Run logs)
  if (!providedKey) {
    console.log('[Auth Failed] Missing x-api-key header');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing x-api-key header' 
    });
  }

  if (providedKey !== secretKey) {
    console.log(`[Auth Failed] Key Mismatch. Received: ${providedKey.substring(0, 3)}..., Expected: ${secretKey ? secretKey.substring(0, 3) + '...' : 'NOT_SET'}`);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid API Key' 
    });
  }
  next();
};

// Ensure data directory exists for local JSON storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

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

// GET all collections (Directly from GCS Bucket folders)
app.get('/api/collections', apiKeyAuth, async (req, res) => {
  try {
    // In GCS, "folders" are just prefixes. We use a delimiter to get them.
    const [files, query, apiResponse] = await bucket.getFiles({
      delimiter: '/',
      autoPaginate: false
    });

    // apiResponse.prefixes contains the "folder" names
    const folders = apiResponse.prefixes || [];
    
    const collections = folders.map(folder => ({
      id: folder.replace('/', ''),
      name: folder.replace('/', ''),
      storagePath: folder
    }));

    res.json(collections);
  } catch (err) {
    console.error("Error fetching collections from GCS:", err);
    res.status(500).send(err.message);
  }
});

// GET wallpapers for a specific collection (Directly from GCS Bucket)
app.get('/api/collections/:collectionName/wallpapers', apiKeyAuth, async (req, res) => {
  try {
    const { collectionName } = req.params;
    
    // Check if we have a locally synced JSON first (to avoid GCS calls)
    const localPath = path.join(dataDir, `${collectionName}.json`);
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath, 'utf8');
      return res.json(JSON.parse(data));
    }

    // Fallback to GCS if no local sync exists
    const [files] = await bucket.getFiles({
      prefix: `${collectionName}/`
    });

    const wallpapers = files
      .filter(file => !file.name.endsWith('/')) // Exclude the folder itself if it exists
      .map(file => ({
        name: file.name.split('/').pop(), // Just the filename
        url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
        fullPath: file.name,
        contentType: file.metadata.contentType,
        updated: file.metadata.updated
      }));

    res.json(wallpapers);
  } catch (err) {
    console.error("Error fetching wallpapers from GCS:", err);
    res.status(500).send(err.message);
  }
});

// NEW: Sync endpoint to save JSON from dashboard
app.post('/api/sync', apiKeyAuth, (req, res) => {
  try {
    const { collectionName, wallpapers } = req.body;
    if (!collectionName || !wallpapers) {
      return res.status(400).send('Missing collectionName or wallpapers');
    }

    const localPath = path.join(dataDir, `${collectionName}.json`);
    fs.writeFileSync(localPath, JSON.stringify(wallpapers, null, 2));
    
    console.log(`Synced collection: ${collectionName}`);
    res.status(200).json({ message: 'Synced successfully', url: `/api/collections/${collectionName}/wallpapers` });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).send(err.message);
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
  console.log(`>>> Available Env Vars: ${Object.keys(process.env).join(', ')}`);
  console.log(`>>> API Key Loaded: ${process.env.WALLPAPER_API_KEY ? 'YES (starts with ' + process.env.WALLPAPER_API_KEY.substring(0, 3) + ')' : 'NO'}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
