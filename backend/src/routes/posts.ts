import { Router } from 'express';
import { getPosts, getPostArchive, getPostTags, getPostById, createPost, updatePost, deletePost } from '../controllers/postController';

const router = Router();

// 归档相关接口
router.get('/archive', getPostArchive);
router.get('/tags', getPostTags);

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
