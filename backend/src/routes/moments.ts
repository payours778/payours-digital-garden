import { Router } from 'express';
import { getMoments, getMomentById, createMoment, updateMoment, deleteMoment, likeMoment } from '../controllers/momentController';
import { requireAdmin } from '../auth';

const router = Router();

router.get('/', getMoments);
router.get('/:id', getMomentById);
router.post('/', requireAdmin, createMoment);
router.put('/:id', requireAdmin, updateMoment);
router.delete('/:id', requireAdmin, deleteMoment);
router.post('/:id/like', likeMoment);  // 公开，游客可点赞

export default router;
