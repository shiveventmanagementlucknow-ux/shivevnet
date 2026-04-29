import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const REQUIRED_VARS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = REQUIRED_VARS.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing Cloudinary env vars: ${missingVars.join(', ')} — image uploads will fail.`);
}

export const requireCloudinary = (req, res, next) => {
  const missing = REQUIRED_VARS.filter(key => !process.env[key]);
  if (missing.length > 0) {
    return res.status(503).json({
      success: false,
      message: 'Image upload service is not configured.',
      missing,
    });
  }
  next();
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'event-management/gallery',
    resource_type: 'auto',
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to allow video uploads
  fileFilter: (req, file, cb) => {   // ← 'res' ki jagah 'file' aur 'cb' sahi params
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only Images (JPG, PNG, WebP) and Videos (MP4, WEBM, MOV) are allowed'), false);
    }
    cb(null, true);
  },
});

export { cloudinary };