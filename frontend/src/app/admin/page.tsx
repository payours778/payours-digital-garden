import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin/moments", label: "说说管理", icon: "💬", description: "管理您的动态说说，支持发布、编辑和删除" },
  { href: "/admin/posts", label: "文章管理", icon: "📝", description: "管理您的博客文章，支持创建、编辑和删除" },
  { href: "/admin/projects", label: "项目管理", icon: "📁", description: "管理您的项目展示，支持添加、编辑和删除" },
  { href: "/admin/photos", label: "照片管理", icon: "🖼️", description: "管理您的相册照片，支持创建相册和上传照片" },
  { href: "/admin/music", label: "音乐管理", icon: "🎵", description: "管理您的音乐列表，支持添加、编辑和删除" },
];

export default function AdminHome() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        欢迎来到管理后台
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700",
              "hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700",
              "transition-all duration-300 cursor-pointer"
            )}
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              {item.label}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}