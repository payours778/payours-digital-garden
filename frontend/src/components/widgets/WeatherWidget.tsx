"use client";

import { useState, useEffect } from "react";

const weatherData = [
  { icon: "☀️", label: "晴", temp: "28°", detail: "体感 30° · 湿度 45% · 微风" },
  { icon: "⛅", label: "多云", temp: "26°", detail: "体感 28° · 湿度 55% · 东风 3级" },
  { icon: "☁️", label: "阴", temp: "24°", detail: "体感 23° · 湿度 70% · 东北风 2级" },
  { icon: "🌧️", label: "小雨", temp: "22°", detail: "体感 21° · 湿度 85% · 南风 3级" },
];

export function WeatherWidget() {
  const [weather, setWeather] = useState(weatherData[0]);
  const [location] = useState("上海");

  useEffect(() => {
    // Simulate weather variation; swap in a real API later
    const idx = Math.floor(Math.random() * weatherData.length);
    setWeather(weatherData[idx]);
  }, []);

  return (
    <div className="rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/5 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">天气</span>
        <span className="text-[10px] text-slate-400 ml-auto">{location}</span>
      </div>
      <div className="p-4 flex items-center gap-4">
        <div className="text-4xl">{weather.icon}</div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{weather.temp}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{weather.label}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{weather.detail}</div>
        </div>
      </div>
    </div>
  );
}
