import { Router } from 'express';
import {
  getMusicList,
  getMusicById,
  createMusic,
  updateMusic,
  deleteMusic,
} from '../controllers/musicController';
import { requireAdmin } from '../auth';

const router = Router();

router.get('/', getMusicList);
router.get('/:id', getMusicById);
router.post('/', requireAdmin, createMusic);
router.put('/:id', requireAdmin, updateMusic);
router.delete('/:id', requireAdmin, deleteMusic);

export default router;
