"use client";

import { useMusic } from "@/contexts/MusicContext";
import { cn } from "@/lib/utils";

export default function MusicPage() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    progress,
    setVolume,
    setPlayMode,
    togglePlay,
    handlePrev,
    handleNext,
    selectTrack,
    handleProgressClick,
    formatTime,
  } = useMusic();

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    handleProgressClick(percent);
  };

  const togglePlayMode = () => {
    const modes: ("loop" | "shuffle" | "single")[] = ["loop", "shuffle", "single"];
    const currentIndex = modes.indexOf(playMode);
    setPlayMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            音乐
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            我只想过平静的生活
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Player */}
          <div>
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-8">
              {/* Vinyl Disc */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                  {/* Outer ring glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl" />
                  
                  {/* Vinyl disc */}
                  <div className={cn(
                    "absolute inset-4 rounded-full bg-gradient-to-br from-slate-900 to-slate-800",
                    "shadow-2xl",
                    isPlaying && "animate-spin-slow"
                  )}>
                    {/* Vinyl grooves */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: "repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)"
                    }} />
                    
                    {/* Center label with album cover */}
                    <div className="absolute inset-[20%] rounded-full overflow-hidden border-4 border-slate-700 shadow-inner">
                      <img
                        src={currentTrack.cover}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Track Info */}
                <div className="mt-6 text-center">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {currentTrack.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div 
                  className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
                  onClick={onProgressClick}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Previous */}
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 4.5l-7.5 7.5 7.5 7.5m6-15l-7.5 7.5 7.5 7.5" />
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.75 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Volume & Play Mode */}
              <div className="flex items-center justify-between">
                {/* Volume */}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Play Mode */}
                <button
                  onClick={togglePlayMode}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {playMode === "loop" && (
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {playMode === "shuffle" && (
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                  {playMode === "single" && (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">1</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Track List */}
          <div>
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-6 h-[500px] overflow-hidden">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 px-2">
                播放列表 ({tracks.length})
              </h3>
              <div className="space-y-2 overflow-y-auto h-[calc(100%-3rem)] pr-2">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all",
                      currentTrack.id === track.id
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                        : "hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                    )}
                  >
                    {/* Cover */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        currentTrack.id === track.id
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {track.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                    
                    {/* Duration */}
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}