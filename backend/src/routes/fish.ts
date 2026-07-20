import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  getRoomByCode,
  sendMessage,
  getMessages,
  deleteRoom,
  getRoomsList,
  resetRoom,
} from '../controllers/fishController';

const router = Router();

router.post('/room', createRoom);
router.post('/room/:code/join', joinRoom);
router.get('/room/:code', getRoomByCode);
router.post('/room/:roomId/messages', sendMessage);
router.get('/room/:roomId/messages', getMessages);
router.delete('/room/:roomId', deleteRoom);
router.get('/rooms', getRoomsList);
router.post('/room/:roomId/reset', resetRoom);

export default router;
