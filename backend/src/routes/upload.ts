import express from 'express';
import multer from 'multer';
import { uploadImageToOSS, deleteImageFromOSS } from '../controllers/uploadController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', upload.single('file'), uploadImageToOSS);
router.delete('/image', deleteImageFromOSS);

export default router;