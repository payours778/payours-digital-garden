import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: "/admin", label: "概览", icon: "🏠" },
  { href: "/admin/moments", label: "说说管理", icon: "💬" },
  { href: "/admin/posts", label: "文章管理", icon: "📝" },
  { href: "/admin/projects", label: "项目管理", icon: "📁" },
  { href: "/admin/photos", label: "照片管理", icon: "🖼️" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border-r border-white/20 dark:border-white/10 z-50">
          <div className="p-6 border-b border-white/20 dark:border-white/10">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              管理后台
            </h1>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                      "text-base font-medium"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        <main className="ml-64 flex-1 p-8 pt-20">
          <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}