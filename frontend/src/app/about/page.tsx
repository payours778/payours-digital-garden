import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-xl mb-6">
            <img
              src="/me.jpg"
              alt="头像"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Payours
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            全栈开发者 | 技术博主 | 摄影爱好者 | 音乐迷
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              关于我
            </h2>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
              <p>
                你好！我是 Payours，一名全栈开发者。现在工作于互联网公司，目前专注于AI领域学习，喜欢探索新技术，同时也喜欢音乐和文学。
              </p>
              <p>
                在工作之余，我会一直经营着这个博客，分享我的技术学习心得、日常随笔以及一些有趣的项目。如果你喜欢我的内容，欢迎关注和交流！
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              技术栈
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"].map((tech) => (
                <div
                  key={tech}
                  className="text-center py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {tech}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              联系方式
            </h2>
            <div className="space-y-3">
              <a
                href="mailto:payours@163.com"
                className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                payours@163.com
              </a>
              <a
                href="https://github.com/payours778"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
