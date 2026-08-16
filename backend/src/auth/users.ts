import { Router } from 'express';
import {
  register, login, me, logout,
  updatePassword, updatePhone, closeAccount,
  loginBySms, sendSms,
} from './userController';
import { requireAuth } from './middleware';

const router = Router();

// 公开接口
router.post('/register', register);
router.post('/login', login);
router.post('/login/sms', loginBySms);     // 预留
router.post('/sms/send', sendSms);         // 预留

// 需要登录
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);
router.patch('/password', requireAuth, updatePassword);
router.patch('/phone', requireAuth, updatePhone);
router.post('/close-account', requireAuth, closeAccount);

export default router;
