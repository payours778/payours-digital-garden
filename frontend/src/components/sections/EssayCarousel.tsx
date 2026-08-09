"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Essay {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

const essays: Essay[] = [
  { id: 1, title: "渔", excerpt: "渝北我去过两次，一次是去钓鱼，另一次还是去钓鱼...", date: "2025-06-30", image: "/essay/covers/fishing.jpg" },
  { id: 2, title: "月", excerpt: "舰船在海上静静地飘，无垠的海空荡荡，到了晚上一点光亮也没有...", date: "2025-04-28", image: "/essay/covers/moon.jpg" },
  { id: 3, title: "春", excerpt: "春天的时候，我第一次登上这座岛屿...", date: "2024-11-08", image: "/essay/covers/spring.jpg" },
  { id: 4, title: "雪围巾", excerpt: "母亲临近过年的时候闲下来，突然想织毛线。她找出来很久没有用过的长针问我说，这个冬天要降温了，要不要给我织一件毛衣，我说我想要一条围巾...", date: "2024-06-29", image: "/essay/covers/snow-scarf.jpg" },
  { id: 5, title: "花", excerpt: "那天下午我什么事都没干，找丁真借了一件体面了衣服，把一朵花插在兜里出发了...", date: "2024-07-03", image: "/essay/covers/flower.jpg" },
  { id: 6, title: "冬", excerpt: "柳暮生日那天，我起得很晚...", date: "2024-06-09", image: "/essay/covers/winter.jpg" },
  { id: 7, title: "山", excerpt: "小时候，每逢黄昏，我总爱去自家屋顶院子里逛逛，祖父的苦瓜藤长得很高，把架子编织的像帐篷一样...", date: "2023-10-25", image: "/essay/covers/mountain.jpg" },
  { id: 8, title: "墓碑", excerpt: "小的时候去山头，给老一辈的祖宗上坟挂清，我一直都记得，大家其乐融融的样子...", date: "2023-05-21", image: "/essay/covers/tombstone.jpg" },
];

const AUTO_PLAY_INTERVAL = 4000;

export function EssayCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % essays.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <article
      className="group relative rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[200px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 封面背景层 — 交叉淡入淡出 */}
      <div className="absolute inset-0">
        {essays.map((essay, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={essay.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* 内容层 — 交叉淡入淡出 */}
      <div className="relative z-10 min-h-[160px]">
        {essays.map((essay, i) => (
          <div
            key={essay.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] bg-indigo-500/15 text-accent px-2.5 py-1 rounded-full font-bold tracking-wide">
                随笔
              </span>
              <span className="text-[10px] text-tertiary ml-auto">
                {i + 1}/{essays.length}
              </span>
            </div>

            <Link href={`/essay/${essay.id}`}>
              <h3 className="inline font-bold text-white group-hover:text-indigo-200 transition-colors text-sm leading-snug bg-black/30 px-1.5 py-0.5 rounded [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                {essay.title}
              </h3>
              <p className="text-xs text-white/90 mt-2 line-clamp-3 leading-relaxed bg-black/25 px-1.5 py-0.5 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                {essay.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-white/80">
                <span className="bg-black/30 px-1.5 py-0.5 rounded">📅 {essay.date}</span>
                <span className="ml-auto bg-indigo-500/40 text-white px-1.5 py-0.5 rounded font-medium">阅读 →</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 指示点 */}
      <div className="relative z-10 flex justify-center gap-1 mt-3">
        {essays.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              setCurrent(i);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 bg-indigo-500"
                : "w-1 bg-tertiary opacity-40 hover:opacity-70"
            }`}
            aria-label={`第 ${i + 1} 篇`}
          />
        ))}
      </div>
    </article>
  );
}
