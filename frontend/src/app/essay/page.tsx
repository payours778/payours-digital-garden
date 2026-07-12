"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Essay {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
}

export default function EssayPage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/essays");
        const data = await res.json();
        setEssays(data.essays || []);
      } catch (error) {
        console.error("获取随笔失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEssays();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <section className="relative mb-16 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            随笔
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            我有一个文青梦
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {essays.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <p className="text-slate-500 dark:text-slate-400">暂无随笔内容</p>
            </div>
          ) : (
            essays.map((essay) => (
              <Link
                key={essay.id}
                href={`/essay/${essay.id}`}
                className={cn(
                  "group rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50",
                  "hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                )}
              >
                <div className="relative h-32 sm:h-48 overflow-hidden">
                  <img
                    src={essay.cover || "/essay/covers/default.jpg"}
                    alt={essay.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm">
                      {essay.date}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {essay.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {essay.excerpt}
                  </p>
                  <div className="mt-4 flex items-center text-indigo-500 dark:text-indigo-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>阅读全文</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}