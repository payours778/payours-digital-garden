"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/projects", label: "项目", icon: "📂" },
  { href: "/essay", label: "随笔", icon: "✍️" },
  { href: "/timeline", label: "归档", icon: "📅" },
  { href: "/photowall", label: "照片墙", icon: "🖼️" },
  { href: "/music", label: "音乐", icon: "🎵" },
  { href: "/moments", label: "说说", icon: "💬" },
  { href: "/about", label: "关于", icon: "👤" },
];

const tags = ["React", "Next.js", "TypeScript", "Python", "AI", "音乐", "摄影", "Docker", "Linux", "读书"];

const stats = [
  { value: "77", label: "文章", color: "text-accent" },
  { value: "8", label: "项目", color: "text-emerald-500" },
  { value: "16", label: "杂谈", color: "text-orange-500" },
  { value: "11", label: "照片", color: "text-pink-500" },
];

function SiteStats() {
  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-4">
      <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">📊 站点统计</h4>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="text-center py-2 rounded-xl surface-strong">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-tertiary mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 gap-5 animate-slide-left">
      {/* 个人卡片 */}
      <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5 mb-3 shadow-lg shadow-indigo-500/20">
          <img
            src="/头像.jpg"
            alt="头像"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h3 className="font-bold text-primary text-lg">Payours</h3>
        <p className="text-xs text-tertiary mt-1">全栈开发者 · 音乐爱好者</p>
        <p className="text-[11px] text-tertiary mt-2">「代码是诗，音乐是光」</p>
      </div>

      {/* 导航 */}
      <nav className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm py-3 overflow-hidden">
        <div className="px-6 pb-2 mb-2 border-b border-theme">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">导航</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm ml-1 transition-all border-l-[3px] ${
                isActive
                  ? "bg-indigo-500/10 text-accent border-indigo-500 font-bold"
                  : "text-secondary border-transparent hover:bg-indigo-500/5 hover:text-accent hover:border-indigo-500"
              }`}
            >
              <span className="text-base">{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 标签云 */}
      <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-4">
        <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">🏷️ 标签云</h4>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full surface-strong text-[11px] text-secondary cursor-pointer hover:text-accent hover:scale-105 transition-all"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 社交链接 */}
      <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-4">
        <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">🔗 社交链接</h4>
        <div className="flex gap-2">
          <a
            href="https://github.com/payours"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-9 rounded-xl surface-strong flex items-center justify-center text-tertiary hover:text-white hover:bg-indigo-500 transition-all text-xs gap-1.5"
          >
            GitHub
          </a>
          <a
            href="#"
            className="flex-1 h-9 rounded-xl surface-strong flex items-center justify-center text-tertiary hover:text-white hover:bg-sky-500 transition-all text-xs gap-1.5"
          >
            Twitter
          </a>
        </div>
      </div>

      {/* 站点统计 */}
      <SiteStats />
    </aside>
  );
}
