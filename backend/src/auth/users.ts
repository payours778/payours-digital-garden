import { Router } from 'express';
import {
  register, login, me, logout,
  updatePassword, updatePhone, closeAccount,
  loginBySms, sendSms,
} from './userController';
import { requireAuth, requireAdmin } from './middleware';
import {
  getUsers, getUserById, createUser, updateUser, deleteUser,
} from './adminUserController';

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

// ---- 管理员用户管理（仅 admin 可访问，需在 /me 等之后挂载，避免 :id 吞掉路由）----
router.get('/admin', requireAdmin, getUsers);
router.post('/admin', requireAdmin, createUser);
router.get('/admin/:id', requireAdmin, getUserById);
router.put('/admin/:id', requireAdmin, updateUser);
router.delete('/admin/:id', requireAdmin, deleteUser);

export default router;
