"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Moment {
  id: number;
  username: string;
  content: string;
  date: string;
  location?: string;
  images?: string[];
  likes: number;
}

type SortType = "latest" | "earliest";

function mapMoment(m: any): Moment {
  return {
    id: m.id,
    username: "Payours",
    content: m.content,
    date: m.created_at,
    images: m.images && m.images.length > 0 ? m.images : undefined,
    likes: m.likes,
  };
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortType>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMoments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/moments");
        const data = await res.json();
        setMoments((data.moments || []).map(mapMoment));
      } catch (error) {
        console.error("获取说说失败:", error);
      }
      setIsLoading(false);
    };
    fetchMoments();
  }, []);

  const sortedMoments = [...moments].sort((a, b) => {
    if (sort === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const filteredMoments = sortedMoments.filter((moment) =>
    moment.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const leftColumn: Moment[] = [];
  const rightColumn: Moment[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  filteredMoments.forEach((moment) => {
    const contentHeight = moment.content.length;
    const imageHeight = (moment.images?.length || 0) * 3;
    const totalHeight = contentHeight + imageHeight;

    if (leftHeight <= rightHeight) {
      leftColumn.push(moment);
      leftHeight += totalHeight;
    } else {
      rightColumn.push(moment);
      rightHeight += totalHeight;
    }
  });

  const MomentCard = ({ moment }: { moment: Moment }) => (
    <Link key={moment.id} href={`/moments/${moment.id}`} className="block">
      <article className="rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/30 dark:border-slate-700/30 shadow-sm p-3 sm:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/40 dark:border-slate-700/40">
            <img src="/me.jpg" alt={moment.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">{moment.username}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">{formatDate(moment.date)}</span>
                <span className="sm:hidden">{formatDateShort(moment.date)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200/60 dark:bg-slate-700/60 mb-5"></div>

        <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-5 whitespace-pre-wrap text-sm">
          {moment.content}
        </p>

        {moment.images && moment.images.length > 0 && (
          <div className={`grid gap-2.5 mb-5 ${moment.images.length === 1 ? "grid-cols-1 max-w-sm" : moment.images.length === 2 ? "grid-cols-2" : moment.images.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {moment.images.map((img, imgIndex) => (
              <div key={imgIndex} className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img src={img} alt="" className="w-full aspect-[4/3] object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {moment.location && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{moment.location}</span>
            </div>
          )}
          <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{moment.likes}</span>
          </button>
        </div>
      </article>
    </Link>
  );

  return (
    <div className="min-h-screen">
      <section className="relative pt-36 pb-20 px-4 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            生活动态
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
            " 在代码之外捕捉瞬间的温度 "
          </p>

          <div className="relative max-w-lg mx-auto mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="搜寻被遗忘的记忆..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/30 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => setSort("latest")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${sort === "latest" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              最新
            </button>
            <button onClick={() => setSort("earliest")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${sort === "earliest" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              最早
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">加载中...</div>
          ) : filteredMoments.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">暂无说说</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-6">
                {leftColumn.map((moment) => <MomentCard key={moment.id} moment={moment} />)}
              </div>
              <div className="space-y-6">
                {rightColumn.map((moment) => <MomentCard key={moment.id} moment={moment} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
