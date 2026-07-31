import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full py-8 px-4 border-t border-theme surface-card backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-secondary">
          &copy; {currentYear} Payours. All rights reserved.
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/about"
            className="text-secondary hover:text-accent transition-colors"
          >
            关于
          </Link>
          <a
            href="https://github.com/payours"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:payours@163.com"
            className="text-secondary hover:text-accent transition-colors"
          >
            邮箱
          </a>
        </div>

        <div className="flex items-center gap-4 text-xs text-tertiary">
          <span>Built with Next.js & Tailwind CSS</span>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            渝ICP备2026013368号
          </a>
        </div>
      </div>
    </footer>
  );
}
