const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('[uploadMedicalFiles] Starting upload for:', file.originalname);
    // PDFs go as raw, images as image
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'medical-portal/appointment-files',
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
  }
};

const uploadMedicalFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // max 5 files
  },
}).array('medicalFiles', 5);

module.exports = uploadMedicalFiles;
