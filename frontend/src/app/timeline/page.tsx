"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  cover: string;
  tags: string[];
  views: number;
  created_at: string;
}

interface TagInfo {
  name: string;
  count: number;
}

interface ArchiveMonth {
  month: string;
  monthName: string;
  count: number;
  posts: { id: number; title: string; date: string }[];
}

interface ArchiveYear {
  year: string;
  months: ArchiveMonth[];
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [archive, setArchive] = useState<ArchiveYear[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "archive">("grid");
  const [selectedTag, setSelectedTag] = useState("全部档案");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const [tagsRes, archiveRes] = await Promise.all([
          fetch("/api/posts/tags"),
          fetch("/api/posts/archive")
        ]);
        const tagsData = await tagsRes.json();
        const archiveData = await archiveRes.json();
        setTags(tagsData.tags || []);
        setTotalPosts(tagsData.total || 0);
        setArchive(archiveData.archive || []);
      } catch (error) {
        console.error("获取标签失败:", error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedTag !== "全部档案") params.append("tag", selectedTag);

        const res = await fetch(`/api/posts?${params.toString()}`);
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("获取文章失败:", error);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, [searchQuery, selectedTag]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const allTags: TagInfo[] = [
    { name: "全部档案", count: totalPosts },
    ...tags,
  ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            文章归档
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            总计 {totalPosts} 篇研究记录
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto mb-8">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索被封存的知识..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {allTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(tag.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTag === tag.name
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700/30"
              }`}
            >
              {tag.name} <span className="opacity-70">{tag.count}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === "timeline"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            时间线路
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            矩阵网格
          </button>
          <button
            onClick={() => setViewMode("archive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === "archive"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            年月归档
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">加载中...</div>
        ) : viewMode === "archive" ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {archive.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">暂无归档内容</p>
              </div>
            ) : (
              archive.map((yearData, yearIndex) => (
                <div key={yearData.year} className="animate-fade-in-up" style={{ animationDelay: `${yearIndex * 100}ms` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{yearData.year}年</h2>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      {yearData.months.reduce((sum, m) => sum + m.count, 0)} 篇
                    </span>
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    {yearData.months.map((monthData, monthIndex) => (
                      <div key={monthData.month} className="animate-fade-in-up" style={{ animationDelay: `${yearIndex * 100 + monthIndex * 50}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{monthData.monthName}</h3>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{monthData.count} 篇</span>
                        </div>
                        <ul className="space-y-2">
                          {monthData.posts.map((post) => (
                            <li key={post.id}>
                              <Link
                                href={`/post/${post.id}`}
                                className="block p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {post.title}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatDate(post.date)}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">暂无相关内容</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-700 dark:to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
            <div className="space-y-8">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`relative flex items-start gap-3 sm:gap-6 animate-fade-in-up ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <Link href={`/post/${post.id}`}>
                      <div className="inline-block max-w-md rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="relative aspect-video overflow-hidden">
                          {post.cover ? (
                            <img
                              src={post.cover}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-700 dark:to-slate-800" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/50 text-white text-xs">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                            {post.excerpt}
                          </p>
                          <div className={`flex flex-wrap gap-1 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-indigo-500/50 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
