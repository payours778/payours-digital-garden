"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Essay {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

const essays: Essay[] = [
  {
    id: 1,
    title: "渔",
    excerpt: "渝北我去过两次，一次是去钓鱼，另一次还是去钓鱼...",
    date: "2025-06-30",
    image: "/essay/covers/fishing.jpg",
  },
  {
    id: 2,
    title: "月",
    excerpt: "舰船在海上静静地飘，无垠的海空荡荡，到了晚上一点光亮也没有...",
    date: "2025-04-28",
    image: "/essay/covers/moon.jpg",
  },
  {
    id: 3,
    title: "春",
    excerpt: "春天的时候，我第一次登上这座岛屿...",
    date: "2024-11-08",
    image: "/essay/covers/spring.jpg",
  },
  {
    id: 4,
    title: "雪围巾",
    excerpt: "母亲临近过年的时候闲下来，突然想织毛线。她找出来很久没有用过的长针问我说，这个冬天要降温了，要不要给我织一件毛衣，我说我想要一条围巾...",
    date: "2024-06-29",
    image: "/essay/covers/snow-scarf.jpg",
  },
  {
    id: 5,
    title: "花",
    excerpt: "那天下午我什么事都没干，找丁真借了一件体面了衣服，把一朵花插在兜里出发了...",
    date: "2024-07-03",
    image: "/essay/covers/flower.jpg",
  },
  {
    id: 6,
    title: "冬",
    excerpt: "柳暮生日那天，我起得很晚...",
    date: "2024-06-09",
    image: "/essay/covers/winter.jpg",
  },
  {
    id: 7,
    title: "山",
    excerpt: "小时候，每逢黄昏，我总爱去自家屋顶院子里逛逛，祖父的苦瓜藤长得很高，把架子编织的像帐篷一样...",
    date: "2023-10-25",
    image: "/essay/covers/mountain.jpg",
  },
  {
    id: 8,
    title: "墓碑",
    excerpt: "小的时候去山头，给老一辈的祖宗上坟挂清，我一直都记得，大家其乐融融的样子...",
    date: "2023-05-21",
    image: "/essay/covers/tombstone.jpg",
  },
];

export default function EssayPage() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {essays.map((essay) => (
            <Link
              key={essay.id}
              href={`/essay/${essay.id}`}
              className={cn(
                "group rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50",
                "hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              )}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={essay.image}
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
          ))}
        </div>
      </div>
    </div>
  );
}