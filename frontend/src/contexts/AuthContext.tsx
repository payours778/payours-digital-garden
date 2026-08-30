"use client";

import {
  createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode, useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken, setToken,
  getStoredUser, setStoredUser,
  clearAuthStorage,
  AUTH_EVENTS,
  apiGet, apiPost, apiPatch,
} from '@/lib/api';

export interface User {
  id: number;
  username: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, phone: string, code: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
  changePhone: (phone: string) => Promise<void>;
  closeAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // SSR 和客户端首屏必须用相同的初始值（null），否则会 hydration mismatch。
  // localStorage 的恢复放到 useLayoutEffect 中（绘制前同步执行）
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthStorage();
    setTokenState(null);
    setUser(null);
  }, []);

  // 0. useLayoutEffect: 在绘制前同步恢复 localStorage 的 user/token，
  //    首屏 SSR/CSR 初始都为 null（匹配），绘制前补齐 → 无闪烁无 mismatch
  useLayoutEffect(() => {
    const savedUser = getStoredUser();
    const savedToken = getToken();
    if (savedUser) setUser(savedUser);
    if (savedToken) setTokenState(savedToken);
  }, []);

  // 1. 初始化：异步校验 /me，如果 token 无效就清掉
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedToken = getToken();
      if (!savedToken) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const data = await apiGet('/api/users/me');
        if (!cancelled) {
          if (data?.user) {
            setUser(data.user as User);
            setStoredUser(data.user);
          } else {
            logout();
          }
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [logout]);

  // 2. 监听 token 过期事件（来自 authFetch）
  useEffect(() => {
    const onExpired = () => {
      logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        router.push('/login');
      }
    };
    window.addEventListener(AUTH_EVENTS.TOKEN_EXPIRED, onExpired);
    return () => window.removeEventListener(AUTH_EVENTS.TOKEN_EXPIRED, onExpired);
  }, [logout, router]);

  // ---- 核心方法 ----
  const login = async (username: string, password: string) => {
    const data = await apiPost('/api/users/login', { username, password });
    if (data.error) throw new Error(data.error);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user as User);
    setStoredUser(data.user);
  };

  const register = async (username: string, password: string, phone: string, code: string) => {
    const data = await apiPost('/api/users/register', { username, password, phone, code });
    if (data.error) throw new Error(data.error);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user as User);
    setStoredUser(data.user);
  };

  const changePassword = async (oldPwd: string, newPwd: string) => {
    const data = await apiPatch('/api/users/password', { oldPassword: oldPwd, newPassword: newPwd });
    if (data.error) throw new Error(data.error);
  };

  const changePhone = async (phone: string) => {
    const data = await apiPatch('/api/users/phone', { phone });
    if (data.error) throw new Error(data.error);
    // 成功后更新本地信息
    const next = { ...user!, phone };
    setUser(next);
    setStoredUser(next);
  };

  const closeAccount = async (password: string) => {
    const data = await apiPost('/api/users/close-account', { password });
    if (data.error) throw new Error(data.error);
    logout();
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      changePassword, changePhone, closeAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
