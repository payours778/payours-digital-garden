import { Router } from 'express';
import { getPosts, getPostArchive, getPostTags, getPostById, createPost, updatePost, deletePost } from '../controllers/postController';
import { requireAdmin } from '../auth';

const router = Router();

// 归档相关接口
router.get('/archive', getPostArchive);
router.get('/tags', getPostTags);

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', requireAdmin, createPost);
router.put('/:id', requireAdmin, updatePost);
router.delete('/:id', requireAdmin, deletePost);

export default router;
