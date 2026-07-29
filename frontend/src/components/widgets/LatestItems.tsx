import Link from "next/link";

const recentItems = [
  { type: "post", title: "深入理解 React Server Components", date: "5月20日", slug: "/post/1" },
  { type: "photo", title: "南昌五一摄影", date: "5月1日", slug: "/nanchang-photos" },
  { type: "note", title: "音乐模块完成", date: "4月28日", slug: "/music-module" },
  { type: "post", title: "Next.js 15 新特性深度解析", date: "4月15日", slug: "/nextjs-15-features" },
  { type: "post", title: "我的日本旅行日记", date: "4月1日", slug: "/japan-travel" },
];

const typeLabels: Record<string, string> = { post: "文章", photo: "照片", note: "记录" };

export function LatestItems() {
  return (
    <div className="rounded-xl surface-strong backdrop-blur-xl border border-subtle">
      <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-medium text-secondary">最近更新</span>
      </div>
      <div className="divide-y divide-border-subtle">
        {recentItems.map((item, index) => (
          <Link
            key={index}
            href={item.slug}
            className="flex items-center gap-3 px-3 py-2.5 hover:surface-card-hover transition-colors"
          >
            <span className="text-[9px] font-medium text-tertiary w-6 flex-shrink-0">{typeLabels[item.type] || ""}</span>
            <span className="flex-1 text-[11px] text-secondary truncate hover:text-primary transition-colors">{item.title}</span>
            <span className="text-[9px] text-tertiary flex-shrink-0">{item.date}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
