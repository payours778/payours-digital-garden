import { Router } from 'express';
import { getEssays, getEssayById, createEssay, updateEssay, deleteEssay } from '../controllers/essayController';

const router = Router();

router.get('/', getEssays);
router.get('/:id', getEssayById);
router.post('/', createEssay);
router.put('/:id', updateEssay);
router.delete('/:id', deleteEssay);

export default router;