"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  cover: string;
  created_at: string;
}

interface Slide {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  tags: string;
  comments: number;
  views: string;
}

const fallbackSlides: Slide[] = [
  {
    title: "二六年南昌五一摄影",
    excerpt: "随便拍拍的照片，记录南昌五一假期的美好时光。",
    date: "2026-05-01",
    slug: "nanchang-photos",
    tags: "摄影, 旅行, 南昌",
    comments: 12,
    views: "3.2k",
  },
  {
    title: "React 19 新特性全面解读",
    excerpt: "React 19 带来了 Actions、useOptimistic、use 等全新 API，本文将逐一解析每个特性的使用场景和最佳实践。",
    date: "2026-07-28",
    slug: "react-19-features",
    tags: "React, 前端, JavaScript",
    comments: 24,
    views: "5.1k",
  },
  {
    title: "京都漫游：古都与现代的碰撞",
    excerpt: "漫步在京都的小巷中，感受千年古都如何在保持传统的同时拥抱现代生活，从清水寺到岚山竹林。",
    date: "2026-07-10",
    slug: "kyoto-travel",
    tags: "旅行, 摄影, 日本",
    comments: 18,
    views: "4.5k",
  },
  {
    title: "2026 上半年我听过的 10 张最佳专辑",
    excerpt: "涵盖后摇、电子、爵士和独立民谣，这 10 张专辑陪我度过了无数个写代码的深夜。",
    date: "2026-07-15",
    slug: "best-albums-2026",
    tags: "音乐, 专辑推荐, 后摇",
    comments: 22,
    views: "3.1k",
  },
];

const AUTO_PLAY_INTERVAL = 5000;

export function FeaturedArticle() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/posts?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts?.length) {
          const fetched: Slide[] = data.posts.map((p: Post) => ({
            title: p.title,
            excerpt: p.excerpt || "",
            date: new Date(p.created_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            slug: `post/${p.id}`,
            tags: "React, Next.js, 前端",
            comments: Math.floor(Math.random() * 30) + 5,
            views: `${(Math.random() * 5 + 1).toFixed(1)}k`,
          }));
          setSlides(fetched);
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const slide = slides[current];

  return (
    <div
      className="relative animate-fade-in-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 轮播容器 */}
      <div className="relative rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
        {/* 装饰光斑 */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 轮播内容 */}
        <Link href={`/${slide.slug}`} className="block">
          <article key={current} className="relative p-6 md:p-8 min-h-[180px] animate-carousel-slide">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] bg-indigo-500/15 text-accent px-3 py-1 rounded-full font-bold tracking-wide">
                ⭐ 精选
              </span>
              <span className="text-[10px] text-tertiary">{slide.date}</span>
              <span className="text-[10px] text-tertiary ml-auto">
                {current + 1} / {slides.length}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-primary leading-snug transition-all duration-300">
              {slide.title}
            </h2>
            <p className="text-sm text-tertiary mt-3 leading-relaxed line-clamp-2 max-w-2xl min-h-[45px]">
              {slide.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-tertiary">
              <span>🏷️ {slide.tags}</span>
              <span>💬 {slide.comments}</span>
              <span>👁️ {slide.views}</span>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                阅读全文 <span className="text-lg">→</span>
              </span>
            </div>
          </article>
        </Link>

        {/* 底部指示点 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 text-tertiary ${
                i === current
                  ? "w-6 bg-indigo-500"
                  : "w-1.5 bg-current opacity-40 hover:opacity-70"
              }`}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
