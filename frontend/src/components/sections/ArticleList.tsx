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

const articles: Article[] = [
  {
    id: 1,
    title: "Leetcode 百题——括号生成",
    excerpt: "一起来学习如何用动态规划解决括号生成问题，包含详细的思路解析和代码实现。",
    date: "2026-05-20 15:08",
    category: "Latest Insight",
    slug: "leetcode-brackets",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop",
  },
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
  return (
    <div className="space-y-8">
      {/* 主网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧大图卡片 */}
        <div className="lg:col-span-5">
          <Link href={`/${articles[0].slug}`}>
            <article className="group rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 h-full">
              {articles[0].image && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={articles[0].image}
                    alt={articles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                        {articles[0].category}
                      </span>
                      <span className="text-xs text-white/80">{articles[0].date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {articles[0].title}
                    </h3>
                  </div>
                </div>
              )}
            </article>
          </Link>
        </div>

        {/* 右侧区域 */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* 右侧顶部大图卡片 */}
          <Link href={`/${articles[1].slug}`}>
            <article className="group rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              {articles[1].image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={articles[1].image}
                    alt={articles[1].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {articles[1].title}
                    </h3>
                    <p className="text-white/70 text-sm">{articles[1].excerpt}</p>
                  </div>
                </div>
              )}
            </article>
          </Link>

          {/* 右侧底部两个小卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.slice(2, 4).map((article) => (
              <Link key={article.id} href={`/${article.slug}`}>
                <article className="group rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                  {article.image && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {article.excerpt}
                    </p>
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
