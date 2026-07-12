"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
// 统计接口必须放在 /:id 之前，否则会被当作 id 匹配
router.get('/stats', projectController_1.getProjectStats);
router.get('/', projectController_1.getProjects);
router.get('/:id', projectController_1.getProjectById);
router.post('/', projectController_1.createProject);
router.put('/:id', projectController_1.updateProject);
router.delete('/:id', projectController_1.deleteProject);
exports.default = router;
//# sourceMappingURL=projects.js.map