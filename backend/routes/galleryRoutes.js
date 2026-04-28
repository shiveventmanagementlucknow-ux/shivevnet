import express from 'express';
import { getGallery, uploadGalleryImage, deleteGalleryImage, updateGalleryImage } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload, requireCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Public
router.get('/', getGallery);

// Admin upload with server-side 60s timeout
router.post(
    '/',
    protect,
    adminOnly,
    requireCloudinary,
    (req, res, next) => {
        const uploadTimeout = setTimeout(() => {
            if (!res.headersSent) {
                console.error('Upload timeout after 60s');
                res.status(504).json({
                    success: false,
                    message: 'Upload timed out. Check your Cloudinary credentials in .env and restart the server.',
                });
            }
        }, 60000);

        upload.single('media')(req, res, (err) => {
            clearTimeout(uploadTimeout);
            if (res.headersSent) return;
            if (err) {
                console.error('Multer error:', err.message);
                return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
            }
            next();
        });
    },
    uploadGalleryImage
);

// Admin delete
router.delete('/:id', protect, adminOnly, deleteGalleryImage);

// Admin update metadata
router.patch('/:id', protect, adminOnly, updateGalleryImage);

export default router;