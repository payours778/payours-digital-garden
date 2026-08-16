import { Router } from 'express';
import multer from 'multer';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadPhoto,
  addPhotos,
  updatePhoto,
  deletePhoto,
  getAllPhotos,
  searchPhotos,
} from '../controllers/photoController';
import { requireAdmin } from '../auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAlbums);
router.get('/all-photos', getAllPhotos);
router.get('/search', searchPhotos);
router.get('/:id', getAlbumById);
router.post('/', requireAdmin, createAlbum);
router.put('/:id', requireAdmin, updateAlbum);
router.delete('/:id', requireAdmin, deleteAlbum);

router.post('/:albumId/upload', requireAdmin, upload.single('file'), uploadPhoto);
router.post('/:albumId/photos', requireAdmin, addPhotos);
router.put('/photos/:id', requireAdmin, updatePhoto);
router.delete('/photos/:id', requireAdmin, deletePhoto);

export default router;
