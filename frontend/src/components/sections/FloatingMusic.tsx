"use client";

import { useState, useEffect, useRef } from "react";
import { useMusic } from "@/contexts/MusicContext";

export function FloatingMusic() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [onLeftSide, setOnLeftSide] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);

  const { currentTrack, isPlaying, togglePlay, handlePrev, handleNext, currentTime, duration, formatTime } = useMusic();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // 拖拽：pointerdown 在球上触发
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    hasMoved.current = false;
    setDragging(true);
  };

  // 拖拽中 + 释放
  useEffect(() => {
    if (!dragging) return;

    const BALL_SIZE = 48;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }

      const initRight = window.innerWidth <= 768 ? 16 : 24;
      const initTop = 80;
      const initX = window.innerWidth - initRight - BALL_SIZE;
      const initY = initTop;

      const currentX = initX + dragStart.current.posX + dx;
      const currentY = initY + dragStart.current.posY + dy;

      const clampedX = Math.max(0, Math.min(window.innerWidth - BALL_SIZE, currentX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - BALL_SIZE, currentY));

      setPos({ x: clampedX - initX, y: clampedY - initY });
      setOnLeftSide(clampedX + BALL_SIZE / 2 < window.innerWidth / 2);
    };

    const handlePointerUp = () => {
      setDragging(false);
      // 没有移动 → 视为点击
      if (!hasMoved.current) {
        setOpen((o) => !o);
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging]);

  return (
    <div
      ref={containerRef}
      className="fixed top-20 right-4 md:right-6 z-50 select-none"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      {/* 弹出卡片 */}
      {open && (
        <div className={`absolute top-14 ${onLeftSide ? "left-0 animate-slide-left" : "right-0 animate-slide-right"} w-72 rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-xl p-4`}>
          {/* 歌曲信息 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-indigo-500/20 animate-float">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">{currentTrack.title}</p>
              <p className="text-[11px] text-tertiary truncate">{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-tertiary hover:text-accent transition-colors text-sm w-6 h-6 flex items-center justify-center rounded-full surface-strong"
            >
              ✕
            </button>
          </div>

          {/* 进度条 */}
          <div className="w-full h-1.5 surface-track rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-tertiary mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{currentTrack.duration}</span>
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center items-center gap-6 mt-3">
            <button onClick={handlePrev} className="text-tertiary hover:text-accent transition-colors text-lg">
              ⏮
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all text-base shadow-lg shadow-indigo-500/30"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={handleNext} className="text-tertiary hover:text-accent transition-colors text-lg">
              ⏭
            </button>
          </div>
        </div>
      )}

      {/* 悬浮球 */}
      <button
        onPointerDown={handlePointerDown}
        className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform ${
          isPlaying && !open ? "animate-pulse-soft" : ""
        } ${dragging ? "cursor-grabbing !scale-110" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        aria-label="音乐播放器"
      >
        {open ? "✕" : "🎵"}
      </button>
    </div>
  );
}
