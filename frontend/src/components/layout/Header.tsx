"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle2, LogIn, Crown, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目" },
  { href: "/essay", label: "随笔" },
  { href: "/timeline", label: "文章归档" },
  { href: "/photowall", label: "照片墙" },
  { href: "/music", label: "音乐" },
  { href: "/tree", label: "灵境" },
  { href: "/moments", label: "说说" },
  { href: "/about", label: "关于我" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 路由切换时关闭菜单
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 点击外部关闭
  useEffect(() => {
    if (!mobileMenuOpen && !userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, userMenuOpen]);

  return (
    <header
      ref={menuRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b surface-card backdrop-blur-xl border-theme shadow-sm",
        // 移动端不滚动隐藏，确保汉堡菜单始终可点
        isScrolled && "md:-translate-y-full"
      )}
    >
      <div className="w-[90%] max-w-6xl mx-auto h-16 flex items-center justify-between px-4 sm:px-[30px] box-border">
        <Link
          href="/"
          className="text-xl font-black text-primary tracking-tighter hover:text-accent transition-all duration-300"
        >
          Payours<span className="text-indigo-500 mx-1">の</span>空中花园
        </Link>

        <div className="flex items-center gap-5">
          {/* 桌面导航 */}
          <nav className="hidden md:flex gap-6 text-sm font-bold">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-secondary hover:text-accent"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 移动端汉堡菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="菜单"
          >
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* 用户区 */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                               surface-card hover:bg-white/30 dark:hover:bg-slate-800/30
                               border border-theme transition-colors"
                    aria-label="用户菜单"
                  >
                    <UserCircle2 className="w-4.5 h-4.5 text-secondary" />
                    <span className="hidden sm:inline text-sm text-primary max-w-[100px] truncate">
                      {user.username}
                    </span>
                    {user.role === 'admin' && (
                      <Crown className="hidden sm:inline w-3.5 h-3.5 text-amber-500" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-2xl
                                    backdrop-blur-xl bg-white/80 dark:bg-slate-900/85
                                    border border-theme shadow-xl z-[60] overflow-hidden">
                      <div className="px-4 py-3 border-b border-theme">
                        <p className="text-sm font-semibold text-primary truncate">{user.username}</p>
                        <p className="text-xs text-tertiary truncate">
                          {user.phone || '未绑定手机'}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-accent hover:surface-card-hover transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" /> 个人空间
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-accent hover:surface-card-hover transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Crown className="w-4 h-4" /> 管理后台
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> 退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm
                             bg-indigo-500/80 hover:bg-indigo-500 text-white
                             shadow-md shadow-indigo-500/20 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">登录</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-transparent border-t border-theme">
          <div className="w-[90%] max-w-6xl mx-auto py-3 grid grid-cols-3 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors",
                    isActive
                      ? "bg-indigo-500 text-white"
                      : "text-secondary hover:surface-card-hover"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
