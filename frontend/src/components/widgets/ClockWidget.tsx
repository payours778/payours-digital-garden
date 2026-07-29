'use client';

import { useState, useEffect } from 'react';

export function ClockWidget() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const Y = now.getFullYear();
      const Mo = String(now.getMonth() + 1).padStart(2, '0');
      const D = String(now.getDate()).padStart(2, '0');
      const W = weekdays[now.getDay()];
      setDate(`${Y}年${Mo}月${D}日 星期${W}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/5 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">实时时钟</span>
      </div>
      <div className="p-4 text-center">
        <div className="text-3xl font-bold text-slate-800 dark:text-white font-mono tracking-wider tabular-nums">{time}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{date}</div>
      </div>
    </div>
  );
}
