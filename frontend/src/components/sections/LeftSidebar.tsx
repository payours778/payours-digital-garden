"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TagCloud } from "@/components/widgets/TagCloud";
import { QuickLinks } from "@/components/widgets/QuickLinks";

interface SiteStats {
  posts: number;
  essays: number;
  photos: number;
  projects: number;
  music: number;
}

export function LeftSidebar() {
  const [stats, setStats] = useState<SiteStats>({ posts: 77, essays: 16, photos: 11, projects: 4, music: 3 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, eRes, alRes, prRes, mRes] = await Promise.all([
          fetch("/api/posts?limit=1"),
          fetch("/api/essays?limit=1"),
          fetch("/api/albums"),
          fetch("/api/projects"),
          fetch("/api/music"),
        ]);
        const pData = await pRes.json();
        const eData = await eRes.json();
        const alData = await alRes.json();
        const prData = await prRes.json();
        const mData = await mRes.json();
        setStats({
          posts: pData.total || 0,
          essays: eData.total || 0,
          photos: alData.total || 0,
          projects: prData.total || 0,
          music: mData.total || 0,
        });
      } catch {
        // use defaults
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
        <div className="p-5 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-4 border-white/30 dark:border-white/10 shadow-lg">
            <img src="/头像.jpg" alt="头像" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Payours</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            在代码、文学与音乐交织中穿梭的普通程序员
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            {[
              { label: "文章", value: stats.posts, color: "text-indigo-500" },
              { label: "随笔", value: stats.essays, color: "text-purple-500" },
              { label: "照片", value: stats.photos, color: "text-pink-500" },
              { label: "项目", value: stats.projects, color: "text-amber-500" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div className="px-5 pb-5 flex justify-center gap-3">
          <a href="https://github.com/payours778" target="_blank" rel="noopener noreferrer"
             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="mailto:payours@163.com"
             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </a>
        </div>
      </div>

      {/* Navigation */}
      <QuickLinks />

      {/* Tag Cloud */}
      <TagCloud />
    </div>
  );
}
