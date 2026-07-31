import { Hero } from "@/components/sections/Hero";
import { LeftSidebar } from "@/components/sections/LeftSidebar";
import { RightSidebar } from "@/components/sections/RightSidebar";
import { FeaturedArticle } from "@/components/sections/FeaturedArticle";
import { ArticleGrid } from "@/components/sections/ArticleGrid";
import { Timeline } from "@/components/sections/Timeline";
import { FooterInfo } from "@/components/sections/FooterInfo";

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-4 md:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* 左侧栏 */}
            <LeftSidebar />

            {/* 主内容区 */}
            <main className="flex-1 min-w-0 space-y-5">
              <FeaturedArticle />
              <ArticleGrid />
              <Timeline />
            </main>

            {/* 右侧栏 */}
            <RightSidebar />
          </div>

          {/* 底部长条：时钟 + 技术栈 + 备案号 */}
          <div className="mt-5">
            <FooterInfo />
          </div>
        </div>
      </section>
    </>
  );
}
