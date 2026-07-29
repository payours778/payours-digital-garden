"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LatestPost {
  id: number;
  title: string;
  created_at: string;
  slug: string;
  views: number;
}

export function LatestPosts() {
  const [posts, setPosts] = useState<LatestPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/posts?limit=5&sort=created_at&order=desc");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch {
        console.error("Failed to fetch latest posts");
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-slate-100 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/5 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">最新文章</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
        {posts.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">暂无文章</div>
        ) : (
          posts.map((post) => {
            const date = new Date(post.created_at);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                <span className="w-8 text-[10px] text-slate-400 font-mono flex-shrink-0">{dateStr}</span>
                <span className="flex-1 text-xs text-slate-600 dark:text-slate-400 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </span>
                <span className="text-[9px] text-slate-400 flex-shrink-0">{post.views} 阅</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
