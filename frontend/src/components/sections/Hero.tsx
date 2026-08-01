export function Hero() {
  return (
    <section className="relative min-h-[28vh] md:min-h-[34vh] flex items-center justify-center pt-24 md:pt-28 pb-6 px-4 overflow-hidden">
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3 md:space-y-5">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-primary animate-fade-in-up">
          Payours<span className="text-indigo-500 mx-2">の</span>空中花园
        </h1>

        <p className="text-xs md:text-base sm:text-lg text-secondary leading-relaxed animate-fade-in-up animation-delay-200 max-w-2xl mx-auto">
          一位普通程序员，热爱技术、文学与音乐。<br />
          在这里分享学习心得，以及我过往的人生。
        </p>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-2 md:pt-3 animate-fade-in-up animation-delay-300">
          <a
            href="/projects"
            className="px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-indigo-600/60 text-white text-xs md:text-sm font-medium hover:bg-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/10"
          >
            查看项目
          </a>
          <a
            href="/timeline"
            className="px-4 py-1.5 md:px-5 md:py-2 rounded-full surface-card text-secondary text-xs md:text-sm font-medium border border-theme hover:border-indigo-500 transition-all duration-300 hover:scale-105"
          >
            阅读文章
          </a>
        </div>
      </div>
    </section>
  );
}