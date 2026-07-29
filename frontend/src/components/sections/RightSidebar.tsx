"use client";

import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { MusicPlayerCompact } from "@/components/widgets/MusicPlayerCompact";
import { LatestPosts } from "@/components/widgets/LatestPosts";
import { DailyQuote } from "@/components/widgets/DailyQuote";
import { MiniStats } from "@/components/widgets/MiniStats";

export function RightSidebar() {
  return (
    <div className="space-y-4">
      <ClockWidget />
      <WeatherWidget />
      <MusicPlayerCompact />
      <LatestPosts />
      <DailyQuote />
      <MiniStats />
    </div>
  );
}
