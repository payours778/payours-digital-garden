"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
// 归档相关接口
router.get('/archive', postController_1.getPostArchive);
router.get('/tags', postController_1.getPostTags);
router.get('/', postController_1.getPosts);
router.get('/:id', postController_1.getPostById);
router.post('/', postController_1.createPost);
router.put('/:id', postController_1.updatePost);
router.delete('/:id', postController_1.deletePost);
exports.default = router;
//# sourceMappingURL=posts.js.map