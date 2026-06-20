export function ProfileCard() {
  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden h-full">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 dark:border-white/10 shadow-lg">
            <img
              src="/头像.jpg"
              alt="头像"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Payours
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              在代码、文学与音乐的交织中穿梭的普通人。近期埋头于各类项目的研究与神经网络计算。
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">77</div>
                <div className="text-slate-500 dark:text-slate-400">文章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">16</div>
                <div className="text-slate-500 dark:text-slate-400">杂谈</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">11</div>
                <div className="text-slate-500 dark:text-slate-400">照片</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
