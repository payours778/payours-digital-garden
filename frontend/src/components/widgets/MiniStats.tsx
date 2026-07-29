export function MiniStats() {
  const stats = [
    { label: "文章", value: "77", color: "text-indigo-500" },
    { label: "杂谈", value: "16", color: "text-purple-500" },
    { label: "照片", value: "11", color: "text-pink-500" },
    { label: "音乐", value: "3", color: "text-emerald-500" },
    { label: "项目", value: "4", color: "text-amber-500" },
  ];

  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-theme flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-xs font-bold text-primary tracking-wide">站点统计</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
