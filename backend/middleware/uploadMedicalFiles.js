/**
 * ============================================================
 * Medical File Upload Middleware
 * ============================================================
 * 
 * Handles the upload of medical files (images and PDFs)
 * attached to appointment bookings. Files are stored on
 * Cloudinary under the "medical-portal/appointment-files" folder.
 * 
 * Features:
 *  - Supports JPG, PNG, and PDF file types
 *  - PDFs are uploaded as 'raw' resources on Cloudinary
 *  - Images are uploaded as 'image' resources
 *  - Max file size: 10MB per file
 *  - Max files per request: 5
 *  - Files are sent via the 'medicalFiles' form field
 * 
 * Usage: router.post('/', uploadMedicalFiles, handler);
 * ============================================================
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary SDK with environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary storage engine for Multer.
 * Dynamically determines the resource_type based on the file's MIME type
 * (PDFs → 'raw', images → 'image').
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('[uploadMedicalFiles] Starting upload for:', file.originalname);

    // Determine if the file is a PDF (requires 'raw' resource type on Cloudinary)
    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: 'medical-portal/appointment-files',          // Cloudinary destination folder
      resource_type: isPdf ? 'raw' : 'image',              // Resource type based on file format
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],      // Allowed file extensions
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`, // Unique filename
    };
  },
});

/**
 * Multer file filter — validates MIME types before upload.
 * Rejects any files that are not JPG, PNG, or PDF.
 * 
 * @param {Object}   req  - Express request object
 * @param {Object}   file - The uploaded file metadata
 * @param {Function} cb   - Callback: cb(error, shouldAccept)
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);   // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
  }
};

/**
 * Configured Multer middleware for medical file uploads.
 * Accepts up to 5 files from the 'medicalFiles' form field.
 */
const uploadMedicalFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 5,                    // Maximum 5 files per upload
  },
}).array('medicalFiles', 5);

module.exports = uploadMedicalFiles;
