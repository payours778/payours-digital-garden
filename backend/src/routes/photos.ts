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

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAlbums);
router.get('/all-photos', getAllPhotos);
router.get('/search', searchPhotos);
router.get('/:id', getAlbumById);
router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

router.post('/:albumId/upload', upload.single('file'), uploadPhoto);
router.post('/:albumId/photos', addPhotos);
router.put('/photos/:id', updatePhoto);
router.delete('/photos/:id', deletePhoto);

export default router;