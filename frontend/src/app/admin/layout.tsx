"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: "/admin", label: "概览", icon: "🏠" },
  { href: "/admin/moments", label: "说说管理", icon: "💬" },
  { href: "/admin/posts", label: "文章管理", icon: "📝" },
  { href: "/admin/projects", label: "项目管理", icon: "📁" },
  { href: "/admin/photos", label: "照片管理", icon: "🖼️" },
  { href: "/admin/music", label: "音乐管理", icon: "🎵" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-8 border border-white/20 dark:border-white/10">
          <h1 className="text-4xl font-bold text-red-500">403</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3">需要管理员权限</p>
          <Link href="/" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Admin 强制 Header 常驻，防止滚动后消失导致侧边栏顶部空一截 */}
      <style>{`
        @media (min-width: 768px) {
          header { transform: translateY(0) !important; }
        }
      `}</style>

      {/* pt-16 补偿 fixed header，让 flex 容器从 header 下方开始；
          这样 sticky aside 初始顶部就在 top-16 位置，底部刚好到视口底部 */}
      <div className="flex pt-16">
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-48 shrink-0 self-start bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border-r border-white/20 dark:border-white/10 z-30">
          <div className="p-4 border-b border-white/20 dark:border-white/10">
            <h1 className="text-base font-bold text-slate-800 dark:text-white">
              管理后台
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {user.username} · {user.role}
            </p>
          </div>

          <nav className="p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                      "text-sm font-medium"
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/20 dark:border-white/10">
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs font-medium"
            >
              退出登录
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
