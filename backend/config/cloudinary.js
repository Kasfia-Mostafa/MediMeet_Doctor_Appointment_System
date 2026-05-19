/**
 * ============================================================
 * Cloudinary Configuration — Image/File Upload Service
 * ============================================================
 * 
 * Configures Cloudinary as the cloud-based storage provider
 * for user avatars, blog cover images, and other general file
 * uploads. Uses multer-storage-cloudinary to integrate Multer
 * (the file upload middleware) with Cloudinary.
 * 
 * Files are stored in the "medical-portal" folder on Cloudinary
 * and automatically resized to a max of 500×500 pixels.
 * 
 * Exports:
 *  - cloudinary: The configured Cloudinary v2 SDK instance
 *  - upload:     A Multer instance configured with Cloudinary storage
 * ============================================================
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medical-portal',                              // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'], // Permitted file types
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Auto-resize images
  },
});

// Create a Multer instance using the Cloudinary storage engine
const upload = multer({ storage });

module.exports = { cloudinary, upload };
