import { Hero } from "@/components/sections/Hero";
import { ArticleList } from "@/components/sections/ArticleList";
import { ProfileCard } from "@/components/sections/ProfileCard";
import { MusicPlayer } from "@/components/sections/MusicPlayer";
import { FooterInfo } from "@/components/sections/FooterInfo";
import { ThemeCard } from "@/components/sections/ThemeCard";
import { ArticleCard } from "@/components/sections/ArticleCard";

function SearchBar() {
  return (
    <div className="max-w-2xl mx-auto mb-6 md:mb-8">
      <div className="relative">
        <svg
          className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="搜寻标题、描述或标签..."
          className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 text-sm md:text-base text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-4 md:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 搜索栏 */}
          <SearchBar />

          {/* 手机端：单列堆叠；桌面端：7/5 布局 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 mb-6 md:mb-8 items-stretch">
            <div className="md:col-span-7">
              <ProfileCard />
            </div>
            <div className="md:col-span-5">
              <MusicPlayer />
            </div>
          </div>

          {/* 文章列表 */}
          <ArticleList />

          {/* 底部卡片区域 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 mt-6 md:mt-8">
            <div className="md:col-span-8">
              <ArticleCard />
            </div>
            <div className="md:col-span-4">
              <ThemeCard />
            </div>
          </div>

          {/* 底部信息栏 */}
          <div className="mt-6 md:mt-8">
            <FooterInfo />
          </div>
        </div>
      </section>
    </>
  );
}
