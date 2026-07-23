"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const photoController_1 = require("../controllers/photoController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', photoController_1.getAlbums);
router.get('/all-photos', photoController_1.getAllPhotos);
router.get('/search', photoController_1.searchPhotos);
router.get('/:id', photoController_1.getAlbumById);
router.post('/', photoController_1.createAlbum);
router.put('/:id', photoController_1.updateAlbum);
router.delete('/:id', photoController_1.deleteAlbum);
router.post('/:albumId/upload', upload.single('file'), photoController_1.uploadPhoto);
router.post('/:albumId/photos', photoController_1.addPhotos);
router.put('/photos/:id', photoController_1.updatePhoto);
router.delete('/photos/:id', photoController_1.deletePhoto);
exports.default = router;
//# sourceMappingURL=photos.js.map