export function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center pt-16 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-200/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-200/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/5 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-800 dark:text-white animate-fade-in-up">
          Payours<span className="text-indigo-500 mx-2">の</span>空中花园
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in-up animation-delay-200 max-w-2xl mx-auto">
          一位普通程序员，热爱技术、文学与音乐。<br />
          在这里分享学习心得，以及我过往的人生。
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up animation-delay-300">
          <a
            href="/projects"
            className="px-6 py-2.5 rounded-full bg-indigo-600/60 text-white font-medium hover:bg-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/10"
          >
            查看项目
          </a>
          <a
            href="/timeline"
            className="px-6 py-2.5 rounded-full bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 font-medium border border-white/40 dark:border-slate-700/40 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:scale-105"
          >
            阅读文章
          </a>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}