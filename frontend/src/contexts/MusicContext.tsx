"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audio?: string;
}

type PlayMode = "loop" | "shuffle" | "single";

interface MusicContextType {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  progress: number;
  isInitialized: boolean;
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setPlayMode: (mode: PlayMode) => void;
  togglePlay: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  selectTrack: (track: Track) => void;
  handleProgressClick: (percent: number) => void;
  formatTime: (time: number) => string;
}

const MusicContext = createContext<MusicContextType | null>(null);

// 默认曲目列表
const defaultTracks: Track[] = [
  { id: 1, title: "Last Days", artist: "吉田靖 (Yasushi Yoshida)", duration: "05:30", cover: "/music/covers/last-days.jpg", audio: "/music/吉田靖 (Yasushi Yoshida) - Last Days.ogg" },
  { id: 2, title: "kokuhaku", artist: "hideyuki hashimoto (橋本 秀幸)", duration: "04:20", cover: "/music/covers/kokuhaku.jpg", audio: "/music/hideyuki hashimoto (橋本 秀幸) - kokuhaku.ogg" },
  { id: 3, title: "Born a Stranger", artist: "Kan Gao", duration: "03:45", cover: "/music/covers/born-a-stranger.jpg", audio: "/music/born-a-stranger.mp3" },
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [tracks] = useState<Track[]>(defaultTracks);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(defaultTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(272);
  const [volume, setVolume] = useState(70);
  const [playMode, setPlayMode] = useState<PlayMode>("loop");
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<number | null>(null);
  const playModeRef = useRef<PlayMode>(playMode);
  const currentTrackRef = useRef<Track>(currentTrack);

  // 组件初始化
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 保持 ref 与 state 同步
  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // 处理进度条更新
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = window.setInterval(() => {
      if (audioRef.current && audioRef.current.duration) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }, 100);
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // 处理音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // 处理播放/暂停
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // 处理音频加载和播放结束
  useEffect(() => {
    if (!audioRef.current) return;

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration || 272);
      }
    };

    const handleEnded = () => {
      const mode = playModeRef.current;
      const current = currentTrackRef.current;
      const currentIndex = tracks.findIndex((t) => t.id === current.id);
      let newIndex: number;
      
      if (mode === "single") {
        newIndex = currentIndex;
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } else if (mode === "shuffle") {
        newIndex = Math.floor(Math.random() * tracks.length);
      } else {
        newIndex = (currentIndex + 1) % tracks.length;
      }
      
      if (mode !== "single") {
        setCurrentTrack(tracks[newIndex]);
        setProgress(0);
        setCurrentTime(0);
      }
    };

    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [tracks]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const newIndex = playMode === "shuffle" 
      ? Math.floor(Math.random() * tracks.length)
      : (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[newIndex]);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current) {
      const audio = audioRef.current;
      const playWhenReady = () => {
        audio.play().catch(() => {});
        audio.removeEventListener('canplaythrough', playWhenReady);
      };
      audio.addEventListener('canplaythrough', playWhenReady);
    }
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    let newIndex: number;
    
    if (playMode === "single") {
      newIndex = currentIndex;
    } else if (playMode === "shuffle") {
      newIndex = Math.floor(Math.random() * tracks.length);
    } else {
      newIndex = (currentIndex + 1) % tracks.length;
    }
    
    setCurrentTrack(tracks[newIndex]);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current) {
      const audio = audioRef.current;
      const playWhenReady = () => {
        audio.play().catch(() => {});
        audio.removeEventListener('canplaythrough', playWhenReady);
      };
      audio.addEventListener('canplaythrough', playWhenReady);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
    
    // 确保音频加载完成后播放
    if (audioRef.current) {
      const audio = audioRef.current;
      const playWhenReady = () => {
        audio.play().catch(() => {});
        audio.removeEventListener('canplaythrough', playWhenReady);
      };
      audio.addEventListener('canplaythrough', playWhenReady);
    }
  };

  const handleProgressClick = (percent: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = percent * duration;
    }
    setProgress(percent * 100);
    setCurrentTime(percent * duration);
  };

  return (
    <MusicContext.Provider value={{
      tracks,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      playMode,
      progress,
      isInitialized,
      setCurrentTrack,
      setIsPlaying,
      setVolume,
      setPlayMode,
      togglePlay,
      handlePrev,
      handleNext,
      selectTrack,
      handleProgressClick,
      formatTime,
    }}>
      {/* 全局音频元素 */}
      <audio
        ref={audioRef}
        src={currentTrack.audio}
        preload="metadata"
        className="hidden"
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}