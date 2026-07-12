"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const musicController_1 = require("../controllers/musicController");
const router = (0, express_1.Router)();
router.get('/', musicController_1.getMusicList);
router.get('/:id', musicController_1.getMusicById);
router.post('/', musicController_1.createMusic);
router.put('/:id', musicController_1.updateMusic);
router.delete('/:id', musicController_1.deleteMusic);
exports.default = router;
//# sourceMappingURL=music.js.map