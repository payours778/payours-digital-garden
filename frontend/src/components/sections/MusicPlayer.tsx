"use client";

import { useMusic } from "@/contexts/MusicContext";
import { cn } from "@/lib/utils";

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handlePrev,
    handleNext,
    formatTime,
  } = useMusic();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden h-full">
      <div className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              Cloud Music
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1 truncate">
              {currentTrack.title}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {currentTrack.artist}
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          点击播放
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 h-3 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{currentTrack.duration}</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 4.5l-7.5 7.5 7.5 7.5M18.75 4.5l-7.5 7.5 7.5 7.5" />
              </svg>
            </button>
            <button 
              onClick={togglePlay}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
                isPlaying 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/30" 
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/30"
              )}
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 4.5l7.5 7.5-7.5 7.5M13.5 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}