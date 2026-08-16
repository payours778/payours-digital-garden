"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative">
      <div className="w-full max-w-sm">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
              欢迎回来
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
              登录你的空中花园
            </p>
          </div>

          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm"
                placeholder="输入用户名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm"
                placeholder="输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium transition shadow-lg shadow-indigo-500/30 text-sm"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
              还没有账号？
            </span>
            <Link href="/register" className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              注册
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/10 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-500">
              短信登录即将上线
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
