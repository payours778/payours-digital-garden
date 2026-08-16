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
import { requireAuth } from '../auth';

const router = Router();

router.post('/room', requireAuth, createRoom);
router.post('/room/:code/join', requireAuth, joinRoom);
router.get('/room/:code', requireAuth, getRoomByCode);
router.get('/room/:code/full', requireAuth, getRoomByCodeFull);
router.post('/room/:roomId/messages', requireAuth, sendMessage);
router.get('/room/:roomId/messages', requireAuth, getMessages);
router.post('/room/:roomId/leave', requireAuth, leaveRoom);
router.get('/rooms', requireAuth, getRoomsList);
router.get('/participant', requireAuth, getParticipantInfo);

export default router;
