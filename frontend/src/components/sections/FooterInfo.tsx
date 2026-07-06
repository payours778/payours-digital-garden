"use client";

import { useState, useEffect, useRef } from "react";

const START_DATE = new Date("2026-06-15");

function calculateRunningDays(): number {
  const now = new Date();
  const diffTime = now.getTime() - START_DATE.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function FooterInfo() {
  const [currentTime, setCurrentTime] = useState("");
  const [runningDays, setRunningDays] = useState(calculateRunningDays);

  const timeTimerRef = useRef<number | null>(null);
  const dayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    timeTimerRef.current = window.setInterval(updateTime, 1000);

    return () => {
      if (timeTimerRef.current) clearInterval(timeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();

    const updateDayAtMidnight = () => {
      setRunningDays(calculateRunningDays());

      dayTimerRef.current = window.setTimeout(() => {
        updateDayAtMidnight();
      }, 24 * 60 * 60 * 1000);
    };

    dayTimerRef.current = window.setTimeout(updateDayAtMidnight, delay);

    return () => {
      if (dayTimerRef.current) clearTimeout(dayTimerRef.current);
    };
  }, []);

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="px-4 md:px-6 py-1.5 md:py-2 rounded-2xl bg-slate-900 dark:bg-black text-white font-mono text-base md:text-xl">
            {currentTime}
          </div>
          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 mr-1">●</span>
            系统已稳定运行：<span className="font-bold text-indigo-600 dark:text-indigo-400">{runningDays}天</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 flex-wrap">
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Next.js 15
          </div>
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            React 19
          </div>
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Tailwind 4
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            渝ICP备2026013368号
          </a>
        </div>
      </div>
    </div>
  );
}
