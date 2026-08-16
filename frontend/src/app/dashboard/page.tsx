"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircle2, KeyRound, Phone, Trash2, LogOut, ChevronLeft, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type TabKey = 'password' | 'phone' | 'danger';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, changePassword, changePhone, closeAccount } = useAuth();

  const [tab, setTab] = useState<TabKey>('password');

  // 改密码
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // 改手机号
  const [phone, setPhone] = useState('');

  // 注销
  const [closePwd, setClosePwd] = useState('');

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 未登录跳登录
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  const reset = () => { setErr(null); setMsg(null); };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!oldPwd || !newPwd) return setErr('请输入旧密码和新密码');
    if (newPwd.length < 6) return setErr('新密码长度不能少于 6 位');
    if (newPwd !== confirmPwd) return setErr('两次输入的新密码不一致');
    try {
      setBusy(true);
      await changePassword(oldPwd, newPwd);
      setMsg('密码修改成功');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      setErr(e.message || '修改失败');
    } finally {
      setBusy(false);
    }
  };

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!/^1[3-9]\d{9}$/.test(phone)) return setErr('请输入 11 位手机号');
    try {
      setBusy(true);
      await changePhone(phone);
      setMsg('手机号修改成功');
    } catch (e: any) {
      setErr(e.message || '修改失败');
    } finally {
      setBusy(false);
    }
  };

  const submitClose = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!closePwd) return setErr('请输入密码确认注销');
    try {
      setBusy(true);
      await closeAccount(closePwd);
      router.push('/');
    } catch (e: any) {
      setErr(e.message || '注销失败');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        加载中...
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const created = user.created_at
    ? new Date(user.created_at.replace(' ', 'T') + 'Z').toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const tabs: { key: TabKey; label: string; icon: any; danger?: boolean }[] = [
    { key: 'password', label: '修改密码', icon: KeyRound },
    { key: 'phone',    label: '绑定手机', icon: Phone },
    { key: 'danger',   label: '账户安全', icon: ShieldCheck, danger: true },
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回 */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 mb-6">
          <ChevronLeft className="w-4 h-4" /> 返回首页
        </Link>

        {/* 资料卡 */}
        <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm mb-6">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner",
              isAdmin
                ? "bg-gradient-to-br from-amber-300/40 to-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-300/30"
                : "bg-gradient-to-br from-indigo-300/40 to-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300/30"
            )}>
              <UserCircle2 className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
                  {user.username}
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-400/20 border border-amber-400/30 text-amber-700 dark:text-amber-300">
                    <Crown className="w-3 h-3" /> 管理员
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {user.phone || '未绑定手机号'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                注册时间：{created}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm
                         text-slate-600 hover:text-red-600 hover:bg-red-500/10
                         dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition shrink-0"
            >
              <LogOut className="w-4 h-4" /> 退出
            </button>
          </div>
        </div>

        {/* tab */}
        <div className="flex gap-2 mb-5 p-1.5 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-slate-900/20 border border-white/10">
          {tabs.map(({ key, label, icon: Icon, danger }) => (
            <button
              key={key}
              onClick={() => { setTab(key); reset(); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition",
                tab === key
                  ? danger
                    ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/20"
                    : "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.slice(0, 2)}</span>
            </button>
          ))}
        </div>

        {/* 提示 */}
        {(err || msg) && (
          <div className={cn(
            "mb-4 px-4 py-3 rounded-xl text-sm border",
            err
              ? "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-300"
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          )}>
            {err || msg}
          </div>
        )}

        {/* 内容 */}
        <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
          {tab === 'password' && (
            <form onSubmit={submitPassword} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-500" /> 修改密码
              </h2>
              <Field label="当前密码">
                <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)}
                  className={inputCls} placeholder="请输入原密码" />
              </Field>
              <Field label="新密码（至少 6 位）">
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  className={inputCls} placeholder="请输入新密码" />
              </Field>
              <Field label="确认新密码">
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  className={inputCls} placeholder="再输入一次新密码" />
              </Field>
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? '处理中...' : '确认修改'}
              </button>
            </form>
          )}

          {tab === 'phone' && (
            <form onSubmit={submitPhone} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-500" /> 绑定手机号
              </h2>
              <Field label="当前手机">
                <div className={cn(inputCls, "text-slate-500 dark:text-slate-400 bg-white/20 dark:bg-slate-800/20 select-none cursor-default")}>
                  {user.phone || '未绑定'}
                </div>
              </Field>
              <Field label="新手机号（大陆 11 位）">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  maxLength={11} className={inputCls} placeholder="例如 13800138000" />
              </Field>
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? '处理中...' : '保存手机号'}
              </button>
            </form>
          )}

          {tab === 'danger' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" /> 账户安全
              </h2>

              {isAdmin ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
                  <Crown className="w-4 h-4 inline mr-1.5 align-[-2px]" />
                  管理员账号不支持自助注销，以防止误删除。
                </div>
              ) : (
                <form onSubmit={submitClose} className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
                    <Trash2 className="w-4 h-4 inline mr-1.5 align-[-2px]" />
                    注销后，您的账户将被永久删除且不可恢复，请谨慎操作。
                  </div>
                  <Field label="输入当前密码确认注销">
                    <input type="password" value={closePwd} onChange={e => setClosePwd(e.target.value)}
                      className={inputCls} placeholder="请输入密码" />
                  </Field>
                  <button type="submit" disabled={busy} className={btnDanger}>
                    {busy ? '处理中...' : '永久注销账户'}
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-white/10">
                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-sm transition">
                  <LogOut className="w-4 h-4" /> 退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Reusable helpers ----------
const inputCls = [
  "w-full px-4 py-3 rounded-xl",
  "bg-white/50 dark:bg-slate-800/50",
  "border border-white/30 dark:border-white/10",
  "text-slate-800 dark:text-white placeholder-slate-400",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition",
].join(' ');

const btnPrimary = [
  "w-full py-3 rounded-xl",
  "bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50",
  "text-white font-medium transition",
  "shadow-lg shadow-indigo-500/30",
].join(' ');

const btnDanger = [
  "w-full py-3 rounded-xl",
  "bg-red-600/80 hover:bg-red-600 disabled:opacity-50",
  "text-white font-medium transition",
  "shadow-lg shadow-red-500/30",
].join(' ');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
