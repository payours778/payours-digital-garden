"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "生活不是等待风暴过去，而是学会在雨中翩翩起舞。", author: "Vivian Greene" },
  { text: "代码是写给人读的，只是顺便能在机器上运行。", author: "Harold Abelson" },
  { text: "保持好奇，保持愚蠢。", author: "Steve Jobs" },
  { text: "简单的说，我相信少即是多。", author: "Jony Ive" },
  { text: "在某个地方，有人正为你的离场而庆幸；别停下，继续前行。", author: "佚名" },
  { text: "最好的时光就是现在。", author: "村上春树" },
  { text: "走得最慢的人，只要不丧失目标，也比漫无目的徘徊的人走得快。", author: "莱辛" },
  { text: "专注是现代社会最稀缺的能力。", author: "卡尔·纽波特" },
];

export function DailyQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Deterministic daily quote based on date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
      <div className="px-4 py-3 border-b border-indigo-200/30 dark:border-indigo-800/30 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
        </svg>
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">每日一言</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right">&mdash; {quote.author}</p>
      </div>
    </div>
  );
}
