"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoController_1 = require("../controllers/photoController");
const router = (0, express_1.Router)();
// 相册相关路由
router.get('/', photoController_1.getAlbums);
router.get('/all-photos', photoController_1.getAllPhotos);
router.get('/:id', photoController_1.getAlbumById);
router.post('/', photoController_1.createAlbum);
router.put('/:id', photoController_1.updateAlbum);
router.delete('/:id', photoController_1.deleteAlbum);
// 照片相关路由
router.post('/:albumId/photos', photoController_1.addPhotos);
router.delete('/photos/:id', photoController_1.deletePhoto);
exports.default = router;
//# sourceMappingURL=photos.js.map