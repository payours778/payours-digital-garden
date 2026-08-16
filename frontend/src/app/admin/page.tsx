import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin/moments", label: "说说管理", icon: "💬", description: "发布、编辑、删除动态" },
  { href: "/admin/posts", label: "文章管理", icon: "📝", description: "创建、编辑博客文章" },
  { href: "/admin/projects", label: "项目管理", icon: "📁", description: "管理项目展示卡片" },
  { href: "/admin/photos", label: "照片管理", icon: "🖼️", description: "相册与照片上传" },
  { href: "/admin/music", label: "音乐管理", icon: "🎵", description: "添加和管理音乐" },
];

export default function AdminHome() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        欢迎来到管理后台
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg p-3 border border-white/20 dark:border-white/10",
              "hover:shadow-sm hover:border-indigo-300/60 dark:hover:border-indigo-700/60 hover:bg-white dark:hover:bg-slate-800",
              "transition-all duration-200 cursor-pointer"
            )}
          >
            <div className="text-xl mb-1.5">{item.icon}</div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-0.5">
              {item.label}
            </h3>
            <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400 line-clamp-2">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
