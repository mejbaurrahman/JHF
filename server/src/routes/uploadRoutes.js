const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middleware/auth');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Allowed formats: jpg, jpeg, png, gif, webp'));
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large',
          error: 'File size must be less than 5MB'
        });
      }
      return res.status(400).json({ 
        message: 'Upload error',
        error: err.message || 'File upload failed'
      });
    }
    // Handle other errors (file type validation, etc.)
    return res.status(400).json({ 
      message: 'Upload failed',
      error: err.message || 'Invalid file type'
    });
  }
  next();
};

// Protected route - only authenticated users can upload
router.post('/', protect, upload.single('image'), handleMulterError, (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        error: 'Please select an image file to upload'
      });
    }
    
    // Success - return the image URL
    // Construct the path properly
    const fileName = req.file.filename;
    const imagePath = `/uploads/${fileName}`;
    
    console.log('File uploaded successfully:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      imagePath: imagePath
    });
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imagePath,
      filename: fileName,
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error.message 
    });
  }
});

module.exports = router;
