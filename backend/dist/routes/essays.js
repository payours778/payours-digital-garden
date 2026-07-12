"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const essayController_1 = require("../controllers/essayController");
const router = (0, express_1.Router)();
router.get('/', essayController_1.getEssays);
router.get('/:id', essayController_1.getEssayById);
router.post('/', essayController_1.createEssay);
router.put('/:id', essayController_1.updateEssay);
router.delete('/:id', essayController_1.deleteEssay);
exports.default = router;
//# sourceMappingURL=essays.js.map