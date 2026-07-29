"use client";

import { useMusic } from "@/contexts/MusicContext";

export function MusicPlayerCompact() {
  const { currentTrack, isPlaying, togglePlay, formatTime, currentTime } = useMusic();

  return (
    <div className="rounded-xl surface-strong backdrop-blur-xl border border-subtle">
      <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span className="text-xs font-medium text-secondary">正在播放</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-theme flex-shrink-0">
            <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-primary truncate">{currentTrack.title}</div>
            <div className="text-[10px] text-tertiary truncate">{currentTrack.artist}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all" style={{ width: (currentTime > 0 ? (currentTime / 272) * 100 : 0) + "%" }} />
              </div>
              <span className="text-[8px] text-tertiary w-7 text-right tabular-nums">{formatTime(currentTime)}</span>
            </div>
          </div>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full border border-theme flex items-center justify-center text-tertiary hover:surface-card-hover transition-colors flex-shrink-0"
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
