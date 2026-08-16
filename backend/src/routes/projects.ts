import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../controllers/projectController';
import { requireAdmin } from '../auth';

const router = Router();

// 统计接口必须放在 /:id 之前，否则会被当作 id 匹配
router.get('/stats', getProjectStats);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireAdmin, createProject);
router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

export default router;
