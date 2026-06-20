import { Metadata } from "next";

export const metadata: Metadata = {
  title: "项目",
  description: "我的个人项目和作品集",
};

interface Project {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  stars: number;
}

const projects: Project[] = [
  {
    id: 1,
    name: "AI Blog Writer",
    description: "基于 GPT-4 的智能博客写作助手，帮助用户生成高质量技术文章。",
    tech: ["Next.js", "React", "OpenAI API", "Tailwind CSS"],
    link: "https://github.com/payours/ai-blog-writer",
    stars: 128,
  },
  {
    id: 2,
    name: "Real-time Collaboration",
    description: "支持多人实时协作的在线白板应用，基于 WebSocket 和 CRDT 算法。",
    tech: ["TypeScript", "Socket.io", "Redis", "PostgreSQL"],
    link: "https://github.com/payours/collab-whiteboard",
    stars: 89,
  },
  {
    id: 3,
    name: "Personal Dashboard",
    description: "个性化仪表盘，整合天气、日历、待办事项和 RSS 阅读器。",
    tech: ["React", "Vite", " Zustand", " Tailwind CSS"],
    link: "https://github.com/payours/dashboard",
    stars: 256,
  },
  {
    id: 4,
    name: "Markdown Editor",
    description: "功能丰富的 Markdown 编辑器，支持实时预览、代码高亮和导出。",
    tech: ["Vue 3", "Monaco Editor", "Node.js", "MongoDB"],
    link: "https://github.com/payours/md-editor",
    stars: 67,
  },
];

export default function ProjectsPage() {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            我的项目
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            这里展示了我的一些个人项目和开源作品，欢迎 Star 和 Fork。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="group relative rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden animate-fade-in-up p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h2>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{project.stars} Stars</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
