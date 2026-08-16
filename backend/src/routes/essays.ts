import { Router } from 'express';
import { getEssays, getEssayById, createEssay, updateEssay, deleteEssay } from '../controllers/essayController';
import { requireAdmin } from '../auth';

const router = Router();

router.get('/', getEssays);
router.get('/:id', getEssayById);
router.post('/', requireAdmin, createEssay);
router.put('/:id', requireAdmin, updateEssay);
router.delete('/:id', requireAdmin, deleteEssay);

export default router;
