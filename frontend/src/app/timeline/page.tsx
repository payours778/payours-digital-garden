"use client";

import { useState } from "react";

interface Post {
  id: number;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image: string;
}

const posts: Post[] = [
  {
    id: 1,
    title: "Leetcode一百题——单词搜索",
    date: "2026-05-12",
    description: "遍历加搜索",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20mysterious%20forest%20with%20glowing%20runes&image_size=landscape_4_3",
  },
  {
    id: 2,
    title: "Leetcode一百题——括号生成",
    date: "2026-05-12",
    description: "暂时没有描述喵...",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20mathematical%20formulas%20floating%20in%20space&image_size=landscape_4_3",
  },
  {
    id: 3,
    title: "Leetcode一百题——组合总和",
    date: "2026-05-10",
    description: "回溯算法 + 排序剪枝求解",
    tags: ["C++", "Leetcode", "题解", "算法"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20puzzle%20pieces%20fitting%20together&image_size=landscape_4_3",
  },
  {
    id: 4,
    title: "Leetcode一百题——电话号码的字母组合",
    date: "2026-05-10",
    description: "最难的是手打字符",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20old%20telephone%20with%20glowing%20numbers&image_size=landscape_4_3",
  },
  {
    id: 5,
    title: "Leetcode一百题——子集",
    date: "2026-05-09",
    description: "回溯",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20abstract%20tree%20branches%20with%20leaves&image_size=landscape_4_3",
  },
  {
    id: 6,
    title: "Leetcode一百题——全排列",
    date: "2026-05-09",
    description: "暂时没有描述喵...",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20colorful%20blocks%20arranged%20in%20patterns&image_size=landscape_4_3",
  },
  {
    id: 7,
    title: "Leetcode一百题——实现Tire（前缀树）",
    date: "2026-05-08",
    description: "搭建前缀树的数据结构，用到了链表",
    tags: ["Leetcode", "C++", "数据结构", "题解"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20digital%20tree%20with%20glowing%20nodes&image_size=landscape_4_3",
  },
  {
    id: 8,
    title: "Leetcode一百题——课程表",
    date: "2026-05-08",
    description: "图+队列",
    tags: ["Leetcode", "C++", "题解", "工作"],
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20school%20classroom%20with%20floating%20books&image_size=landscape_4_3",
  },
];

const allTags = [
  { name: "全部档案", count: 8 },
  { name: "Leetcode", count: 8 },
  { name: "Java", count: 8 },
  { name: "工作", count: 6 },
  { name: "算法", count: 2 },
  { name: "数据结构", count: 1 },
];

export default function TimelinePage() {
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("grid");
  const [selectedTag, setSelectedTag] = useState("全部档案");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === "全部档案" || post.tags.includes(selectedTag);
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            归档与探索
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            总计 {posts.length} 篇研究记录
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
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                    {post.date}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                    {post.description}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
            <div className="space-y-8">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className={`relative flex items-start gap-6 animate-fade-in-up ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="inline-block max-w-md rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/50 text-white text-xs">
                          {post.date}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                          {post.description}
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
                  </div>
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-indigo-500/50 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">暂无相关内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
