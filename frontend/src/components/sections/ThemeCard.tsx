"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden h-full">
      <div className="p-6 text-center h-full flex flex-col justify-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          {isDark ? "夜间模式" : "日间模式"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {isDark ? "萤火虫轻舞的夜晚" : "落樱漫舞的清晨"}
        </p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          切换主题
        </button>
      </div>
    </div>
  );
}
