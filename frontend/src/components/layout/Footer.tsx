import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full py-8 px-4 border-t border-white/10 bg-white/30 dark:bg-slate-900/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          © {currentYear} Payours. All rights reserved.
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/about"
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            关于
          </Link>
          <a
            href="https://github.com/payours"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:payours@163.com"
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            邮箱
          </a>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-500">
          Built with Next.js & Tailwind CSS
        </div>
      </div>
    </footer>
  );
}
