const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const activityDates = [1, 5, 8, 12, 15, 20, 22, 25, 28, 30];

export function CalendarWidget() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayDate = today.getDate();

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm">
      <div className="px-4 py-3 border-b border-theme flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">📅 日历</span>
        <span className="text-[10px] text-tertiary ml-auto">{year}年{month + 1}月</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((d, i) => (
            <div key={i} className={"text-center text-[10px] py-1 " + (i === 0 || i === 6 ? "text-tertiary" : "text-secondary")}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, i) => <div key={"b" + i} className="text-center py-1.5" />)}
          {days.map((day) => {
            const dow = new Date(year, month, day).getDay();
            const isToday = day === todayDate;
            const hasActivity = activityDates.includes(day);
            const isWeekend = dow === 0 || dow === 6;

            let cls = "relative text-center py-1.5 rounded-lg text-xs transition-colors cursor-default";
            if (isToday) {
              cls += " bg-indigo-500/15 text-accent font-bold";
            } else if (isWeekend) {
              cls += " text-tertiary hover:bg-indigo-500/5";
            } else {
              cls += " text-secondary hover:bg-indigo-500/5";
            }

            return (
              <div key={day} className={cls}>
                {day}
                {hasActivity && !isToday && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current text-accent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
