import express from 'express';
import multer from 'multer';
import { uploadImageToOSS, deleteImageFromOSS } from '../controllers/uploadController';
import { requireAdmin } from '../auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', requireAdmin, upload.single('file'), uploadImageToOSS);
router.delete('/image', requireAdmin, deleteImageFromOSS);

export default router;
