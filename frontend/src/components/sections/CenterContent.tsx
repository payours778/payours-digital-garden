"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PostItem {
  id: number;
  title: string;
  excerpt: string;
  cover: string;
  created_at: string;
  slug: string;
  tags: string[];
  views: number;
}

interface ArchiveEntry {
  id: number;
  title: string;
  date: string;
}

export function CenterContent() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [timeline, setTimeline] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch("/api/posts?limit=5"),
          fetch("/api/posts/archive"),
        ]);
        const pData = await pRes.json();
        const aData = await aRes.json();
        setPosts(pData.posts || []);
        // Flatten archive into a timeline list
        const entries: ArchiveEntry[] = [];
        if (aData.archive) {
          for (const year of aData.archive) {
            for (const month of year.months) {
              for (const post of month.posts) {
                entries.push(post);
              }
            }
          }
        }
        setTimeline(entries.slice(0, 8));
      } catch {
        console.error("Failed to fetch center content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  const featured = posts[0];
  const gridPosts = posts.slice(1, 5);

  return (
    <div className="space-y-6">
      {/* Featured Article (large) */}
      {featured && (
        <Link href={`/post/${featured.id}`}>
          <article className="group relative rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-500">
            {featured.cover ? (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
              </div>
            ) : (
              <div className="h-64 md:h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-white/30 dark:bg-slate-700/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-3">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-sm text-white/80 mt-2 line-clamp-2">{featured.excerpt}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                <span>{formatDate(featured.created_at)}</span>
                <span>·</span>
                <span>{featured.views} 次浏览</span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* 2x2 Article Grid */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gridPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <article className="group rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-500 h-full flex flex-col">
                {post.cover ? (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                ) : null}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">{formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Timeline list */}
      {timeline.length > 0 && (
        <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">时间线</span>
            <Link href="/timeline" className="text-[10px] text-indigo-500 ml-auto hover:text-indigo-600 transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {timeline.map((entry, idx) => (
              <Link
                key={entry.id}
                href={`/post/${entry.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                  <span className="text-xs text-slate-400 font-mono w-20 flex-shrink-0 tabular-nums">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {entry.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
