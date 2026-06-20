"use client";

import Link from "next/link";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

const article: Article = {
  id: 1,
  title: "深入理解 React Server Components",
  excerpt: "探索 RSC 的核心概念、使用场景以及它如何改变我们构建 Next.js 应用的方式...",
  date: "2026-05-20",
  tags: ["React", "Next.js"],
};

export function ArticleCard() {
  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-indigo-500 dark:text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              文章
            </span>
            <span className="text-xs text-slate-400">{article.date}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href="/article/1"
            className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            阅读全文 →
          </Link>
        </div>
      </div>
    </div>
  );
}
