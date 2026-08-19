import { Router } from 'express';
import { requireAuth } from '../auth';
import { getFarmState, updateFarmState } from '../controllers/gameController';

const router = Router();

// 农场游戏
router.get('/farm/state', requireAuth, getFarmState);
router.put('/farm/state', requireAuth, updateFarmState);

export default router;
