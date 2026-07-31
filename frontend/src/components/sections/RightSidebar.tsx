"use client";

import { useState, useEffect } from "react";
import { useMusic } from "@/contexts/MusicContext";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";

/* ===== 紧凑时钟 ===== */
function ClockCard() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
      setDate(`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
      setWeekday(weekdays[now.getDay()]);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5 text-center">
      <div className="text-4xl font-black text-accent mb-1 tracking-tight font-mono">{time}</div>
      <div className="text-xs text-tertiary">{date}</div>
      <div className="text-xs text-tertiary mt-0.5">{weekday}</div>
    </div>
  );
}

/* ===== 天气 ===== */
function WeatherCard() {
  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest">☁️ 天气</h4>
        <span className="text-[10px] text-tertiary">深圳</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-5xl">🌤️</span>
        <div>
          <div className="text-3xl font-black text-primary">32°</div>
          <div className="text-xs text-tertiary mt-0.5">多云转晴</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4 text-center">
        <div>
          <div className="text-[10px] text-tertiary">明天</div>
          <div className="text-sm">🌤️</div>
          <div className="text-[10px] text-tertiary">30°</div>
        </div>
        <div>
          <div className="text-[10px] text-tertiary">周日</div>
          <div className="text-sm">☀️</div>
          <div className="text-[10px] text-tertiary">33°</div>
        </div>
        <div>
          <div className="text-[10px] text-tertiary">周一</div>
          <div className="text-sm">⛅</div>
          <div className="text-[10px] text-tertiary">31°</div>
        </div>
        <div>
          <div className="text-[10px] text-tertiary">周二</div>
          <div className="text-sm">🌧️</div>
          <div className="text-[10px] text-tertiary">28°</div>
        </div>
      </div>
    </div>
  );
}

/* ===== 紧凑音乐播放器 ===== */
function CompactMusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, handlePrev, handleNext, currentTime, duration, formatTime } = useMusic();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-lg flex-shrink-0 animate-float shadow-lg shadow-indigo-500/20">
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-tertiary truncate">{currentTrack.artist}</p>
        </div>
      </div>
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
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={handlePrev}
          className="text-tertiary hover:text-accent transition-colors text-sm"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all text-sm shadow-lg shadow-indigo-500/30"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={handleNext}
          className="text-tertiary hover:text-accent transition-colors text-sm"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}

/* ===== 最新文章 ===== */
const latestPosts = [
  { title: "React 19 新特性全面解读", date: "07-28", views: "3.2k" },
  { title: "TypeScript 5.6 类型体操指南", date: "07-25", views: "1.2k" },
  { title: "Docker Compose 编排微服务", date: "07-20", views: "2.4k" },
  { title: "京都漫游：古都与现代的碰撞", date: "07-10", views: "4.5k" },
];

function LatestArticles() {
  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5">
      <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">📝 最新文章</h4>
      <div className="space-y-2.5">
        {latestPosts.map((post, i) => (
          <a key={i} href="#" className="block group">
            <p className="text-xs text-secondary group-hover:text-accent transition-colors leading-snug line-clamp-2">
              {post.title}
            </p>
            <span className="text-[10px] text-tertiary">
              {post.date} · {post.views} 阅读
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== 每日一言 ===== */
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "代码是诗，音乐是光。", author: "Payours" },
  { text: "保持热爱，奔赴山海。", author: "佚名" },
];

function DailyQuote() {
  const quote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
  return (
    <div className="rounded-2xl surface-card backdrop-blur-xl border border-theme shadow-sm p-5">
      <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">💡 每日一言</h4>
      <blockquote className="text-sm text-secondary italic leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-[11px] text-tertiary text-right mt-2">&mdash; {quote.author}</p>
    </div>
  );
}

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 gap-5 animate-slide-right">
      <ClockCard />
      <WeatherCard />
      <CalendarWidget />
      <CompactMusicPlayer />
      <LatestArticles />
      <DailyQuote />
    </aside>
  );
}
