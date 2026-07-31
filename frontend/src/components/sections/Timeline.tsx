const timelineItems = [
  { date: "07-28", title: "React 19 新特性全面解读", comments: 12 },
  { date: "07-25", title: "TypeScript 5.6 类型体操指南", comments: 8 },
  { date: "07-20", title: "Docker Compose 编排微服务", comments: 15 },
  { date: "07-15", title: "2026 上半年 10 张最佳专辑", comments: 22 },
  { date: "07-10", title: "京都漫游：古都与现代的碰撞", comments: 18 },
  { date: "07-05", title: "Rust 异步编程：从 Tokio 到自建 Runtime", comments: 30 },
  { date: "06-28", title: "Next.js 15 服务端组件深度解析", comments: 25 },
  { date: "06-20", title: "Tailwind CSS v4 迁移实战记录", comments: 9 },
  { date: "06-12", title: "GitHub Actions 自动化部署全指南", comments: 14 },
  { date: "06-01", title: "冰岛环岛自驾：极光与冰川之旅", comments: 35 },
];

export function Timeline() {
  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5 animate-fade-in-up animation-delay-400">
      <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-4">📜 时间线</h4>
      {timelineItems.map((item, i) => (
        <a
          key={i}
          href="#"
          className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl group border-b border-theme last:border-0 hover:bg-indigo-500/5 transition-all"
        >
          <span className="text-[11px] text-tertiary w-14 flex-shrink-0">{item.date}</span>
          <span className="flex-1 text-sm text-secondary group-hover:text-accent transition-colors truncate">
            {item.title}
          </span>
          <span className="text-[10px] text-tertiary flex-shrink-0">💬 {item.comments}</span>
        </a>
      ))}
      <div className="text-center mt-3">
        <a
          href="#"
          className="inline-block text-xs font-bold text-accent hover:text-indigo-600 transition-colors"
        >
          查看全部文章 →
        </a>
      </div>
    </div>
  );
}
