import { Router } from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotos,
  deletePhoto,
  getAllPhotos,
} from '../controllers/photoController';

const router = Router();

// 相册相关路由
router.get('/', getAlbums);
router.get('/all-photos', getAllPhotos);
router.get('/:id', getAlbumById);
router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

// 照片相关路由
router.post('/:albumId/photos', addPhotos);
router.delete('/photos/:id', deletePhoto);

export default router;
