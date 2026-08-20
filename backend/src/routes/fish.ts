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
  listPublicRooms,
  getMyRooms,
  deleteRoom,
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
router.delete('/room/:roomId', requireAuth, deleteRoom);
router.get('/rooms', requireAuth, getRoomsList);
router.get('/rooms/public', requireAuth, listPublicRooms);
router.get('/my-rooms', requireAuth, getMyRooms);
router.get('/participant', requireAuth, getParticipantInfo);

export default router;
