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
    <div className="rounded-3xl surface-card backdrop-blur-xl border border-theme shadow-sm overflow-hidden h-full">
      <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <span className="text-xs text-accent px-2 md:px-2.5 py-1 rounded-full bg-indigo-500/10">
              文章
            </span>
            <span className="text-xs text-tertiary">{article.date}</span>
          </div>
          <h3 className="text-base md:text-lg font-bold text-primary mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs md:text-sm text-tertiary line-clamp-3">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3 md:mt-4">
          <div className="flex gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-tertiary px-2 py-0.5 rounded surface-strong"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href="/article/1"
            className="text-xs md:text-sm text-accent hover:text-indigo-600 transition-colors"
          >
            阅读全文 →
          </Link>
        </div>
      </div>
    </div>
  );
}
