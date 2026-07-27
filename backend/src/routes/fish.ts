import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  getRoomByCode,
  getRoomByCodeFull,
  sendMessage,
  getMessages,
  getRoomsList,
  leaveRoom,
  getParticipantInfo,
} from '../controllers/fishController';

const router = Router();

router.post('/room', createRoom);
router.post('/room/:code/join', joinRoom);
router.get('/room/:code', getRoomByCode);
router.get('/room/:code/full', getRoomByCodeFull);
router.post('/room/:roomId/messages', sendMessage);
router.get('/room/:roomId/messages', getMessages);
router.post('/room/:roomId/leave', leaveRoom);
router.get('/rooms', getRoomsList);
router.get('/participant', getParticipantInfo);

export default router;
