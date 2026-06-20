"use client";

import { useParams, useRouter } from "next/navigation";
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

const moments: Moment[] = [
  {
    id: 1,
    username: "Payours",
    content: "这次新更新了等级系统和炼金实验室还有帝江号 还修复了一些bug。后续大更新可能就没那么快了。到时候在b站做个视频说明一下更新内容。",
    date: "2026-05-18",
    location: "江西省 南昌市 高新区",
    images: [
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
    ],
    likes: 42,
  },
  {
    id: 2,
    username: "Payours",
    content: "做了一个干员休息处，动画都是自己扣的，累死了，后面看看想想怎么完善",
    date: "2026-05-15",
    location: "江西省 南昌市 高新区",
    likes: 28,
  },
  {
    id: 3,
    username: "Payours",
    content: "今天更新了奇怪的灵镜系统，带魔法炼金和帝江号。目前帝江号还没完善，后面我想再加个升级系统，激励自己写博客维护网站，但是我感觉我开源的话可能不是很多人喜欢这种升级系统。所以我打算再写一个在设置里面能够自己决定是否开启的选项。",
    date: "2026-05-13",
    location: "江西省 南昌市 高新区",
    images: ["https://aka.doubaocdn.com/s/qRVc1wVANu"],
    likes: 35,
  },
  {
    id: 4,
    username: "Payours",
    content: "今天也要好好睡觉呀",
    date: "2026-05-12",
    location: "江西省 南昌市 高新区",
    likes: 56,
  },
  {
    id: 5,
    username: "Payours",
    content: "今天更新了博客对移动端的适配😢",
    date: "2026-05-09",
    location: "江西省 南昌市 高新区",
    likes: 23,
  },
  {
    id: 6,
    username: "Payours",
    content: "终于把博客从 Hexo 迁移到 Next.js 了！感觉打开了新世界的大门 🚀",
    date: "2026-05-05",
    location: "南昌市",
    images: [
      "https://aka.doubaocdn.com/s/GEt21wVANu",
      "https://aka.doubaocdn.com/s/GEt21wVANu",
      "https://aka.doubaocdn.com/s/GEt21wVANu",
    ],
    likes: 89,
  },
  {
    id: 7,
    username: "Payours",
    content: "周末尝试了新的摄影技巧，拍了一些不错的照片，整理一下发上来~",
    date: "2026-05-03",
    location: "南昌市",
    images: [
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
      "https://aka.doubaocdn.com/s/qRVc1wVANu",
    ],
    likes: 67,
  },
  {
    id: 8,
    username: "Payours",
    content: "学习了新的技术栈，感觉收获满满",
    date: "2026-04-28",
    location: "江西省",
    likes: 44,
  },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

export default function MomentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const momentId = parseInt(params.id as string);
  const moment = moments.find((m) => m.id === momentId);

  if (!moment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">说说不存在</h1>
          <Link
            href="/moments"
            className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
          >
            返回说说列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative pt-36 pb-8 px-4">
        <div className="relative max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          <article className="rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/30 dark:border-slate-700/30 shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/40 dark:border-slate-700/40">
                <img
                  src="/me.jpg"
                  alt={moment.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">
                  {moment.username}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {formatDate(moment.date)}
                </p>
                {moment.location && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{moment.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {moment.content}
              </p>
            </div>

            {moment.images && moment.images.length > 0 && (
              <div className="mb-8">
                <div
                  className={`grid gap-3 ${
                    moment.images.length === 1
                      ? "grid-cols-1"
                      : moment.images.length === 2
                      ? "grid-cols-2"
                      : moment.images.length <= 4
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  }`}
                >
                  {moment.images.map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-square"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-medium">{moment.likes}</span>
              </button>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">评论</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="font-medium">分享</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
