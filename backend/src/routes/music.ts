import { Router } from 'express';
import {
  getMusicList,
  getMusicById,
  createMusic,
  updateMusic,
  deleteMusic,
} from '../controllers/musicController';

const router = Router();

router.get('/', getMusicList);
router.get('/:id', getMusicById);
router.post('/', createMusic);
router.put('/:id', updateMusic);
router.delete('/:id', deleteMusic);

export default router;
