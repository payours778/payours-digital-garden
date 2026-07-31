const articles = [
  {
    icon: "📝",
    title: "TypeScript 5.6 类型体操实战指南",
    excerpt: "深入探讨 TypeScript 5.6 中新增的类型工具和模式，通过实际案例展示如何在项目中运用高级类型...",
    date: "07-25",
    comments: 8,
    views: "1.2k",
    gradient: "from-indigo-200 to-purple-200",
  },
  {
    icon: "🐳",
    title: "Docker Compose 编排微服务最佳实践",
    excerpt: "从单机到集群，分享我在生产环境中使用 Docker Compose 管理多个微服务的经验和踩坑记录...",
    date: "07-20",
    comments: 15,
    views: "2.4k",
    gradient: "from-emerald-200 to-teal-200",
  },
  {
    icon: "🎵",
    title: "2026 上半年我听过的 10 张最佳专辑",
    excerpt: "涵盖后摇、电子、爵士和独立民谣，这 10 张专辑陪我度过了无数个写代码的深夜...",
    date: "07-15",
    comments: 22,
    views: "3.1k",
    gradient: "from-orange-200 to-amber-200",
  },
  {
    icon: "📷",
    title: "京都漫游：古都的现代与传统的碰撞",
    excerpt: "漫步在京都的小巷中，感受千年古都如何在保持传统的同时拥抱现代生活...",
    date: "07-10",
    comments: 18,
    views: "4.5k",
    gradient: "from-rose-200 to-pink-200",
  },
];

export function ArticleGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-200">
      {articles.map((a, i) => (
        <article
          key={i}
          className="group rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all`}
          >
            {a.icon}
          </div>
          <h3 className="font-bold text-primary group-hover:text-accent transition-colors text-sm leading-snug">
            {a.title}
          </h3>
          <p className="text-xs text-tertiary mt-2 line-clamp-2 leading-relaxed">{a.excerpt}</p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-tertiary">
            <span>📅 {a.date}</span>
            <span>💬 {a.comments}</span>
            <span>👁️ {a.views}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
