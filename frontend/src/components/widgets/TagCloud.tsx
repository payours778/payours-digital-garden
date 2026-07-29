export function TagCloud() {
  const tags = [
    { name: "React", count: 12 },
    { name: "Next.js", count: 8 },
    { name: "TypeScript", count: 10 },
    { name: "AI", count: 6 },
    { name: "摄影", count: 15 },
    { name: "音乐", count: 5 },
    { name: "生活", count: 9 },
    { name: "旅行", count: 4 },
    { name: "阅读", count: 7 },
    { name: "CSS", count: 6 },
  ];

  return (
    <div className="rounded-xl surface-strong backdrop-blur-xl border border-subtle">
      <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-xs font-medium text-secondary">标签</span>
        <span className="text-[9px] text-tertiary ml-auto">{tags.length}</span>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-secondary surface-card border border-border-subtle hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-default"
            >
              {tag.name}
              <span className="text-[8px] text-tertiary">{tag.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
