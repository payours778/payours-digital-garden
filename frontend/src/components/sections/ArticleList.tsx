'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  image?: string;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  cover: string;
  created_at: string;
  slug: string;
}

const staticArticles: Article[] = [
  {
    id: 2,
    title: "二六年南昌五一摄影",
    excerpt: "随便拍拍的照片，记录南昌五一假期的美好时光。",
    date: "2026-05-01",
    category: "Photos",
    slug: "nanchang-photos",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "音乐板块完成",
    excerpt: "本来没想做音乐板块的，但是感觉少了点什么，花了一下午把音乐模块构建出来了",
    date: "2026-04-28 16:31",
    category: "Records",
    slug: "music-module",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Next.js 15 新特性深度解析",
    excerpt: "探索 Next.js 15 中的 App Router 改进、React 19 支持以及性能优化策略。",
    date: "2026-04-15",
    category: "Tech",
    slug: "nextjs-15-features",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "我的日本旅行日记",
    excerpt: "记录我在东京、大阪和京都的十天之旅，分享美食、风景与人文体验。",
    date: "2026-04-01",
    category: "Life",
    slug: "japan-travel",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
  },
];

export function ArticleList() {
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/posts?limit=1");
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setLatestPost(data.posts[0]);
        }
      } catch (error) {
        console.error("获取最新文章失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestPost();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const featuredArticle: Article = latestPost
    ? {
        id: latestPost.id,
        title: latestPost.title,
        excerpt: latestPost.excerpt || "",
        date: formatDate(latestPost.created_at),
        category: "Latest Insight",
        slug: `post/${latestPost.id}`,
        image: latestPost.cover,
      }
    : staticArticles[0];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
        <div className="lg:col-span-5">
          <Link href={`/${featuredArticle.slug}`}>
            <article className="group rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col">
              {featuredArticle.image ? (
                <div className="relative flex-[9] overflow-hidden min-h-0">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-2">
                      {featuredArticle.category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="relative flex-[9] overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/30 dark:bg-slate-700/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-2">
                      {featuredArticle.category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>
              )}
              <div className="flex-[1] flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-300">{featuredArticle.date}</span>
                <span className="text-sm text-indigo-500 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                  阅读更多 →
                </span>
              </div>
            </article>
          </Link>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-3 md:gap-6">
          <Link href={`/${staticArticles[0].slug}`}>
            <article className="group rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              {staticArticles[0].image && (
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img
                    src={staticArticles[0].image}
                    alt={staticArticles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {staticArticles[0].title}
                    </h3>
                    <p className="text-sm text-white/80 line-clamp-2 mt-1.5">
                      {staticArticles[0].excerpt}
                    </p>
                  </div>
                </div>
              )}
              <div className="p-5 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">{staticArticles[0].date}</span>
                <span className="text-sm text-indigo-500 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                  阅读更多 →
                </span>
              </div>
            </article>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {staticArticles.slice(1, 3).map((article) => (
              <Link key={article.id} href={`/${article.slug}`}>
                <article className="group rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                  {article.image && (
                    <div className="relative h-40 md:h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{article.date}</span>
                    <span className="text-sm text-indigo-500 dark:text-indigo-400 font-medium">
                      阅读更多 →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}