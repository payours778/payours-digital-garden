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
      <div className="p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="px-6 py-2 rounded-2xl bg-slate-900 dark:bg-black text-white font-mono text-xl">
            {currentTime}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 mr-1">●</span>
            系统已稳定运行：<span className="font-bold text-indigo-600 dark:text-indigo-400">{runningDays}天</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Next.js 15
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            React 19
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/30 dark:bg-white/5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Tailwind 4
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          暂未备案
        </div>
      </div>
    </div>
  );
}
