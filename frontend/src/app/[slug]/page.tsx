import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const posts = {
  "nextjs-15-features": {
    title: "Next.js 15 新特性深度解析",
    date: "2026-05-20",
    category: "技术",
    content: `
## 引言

Next.js 15 带来了众多激动人心的新特性，本文将深入解析其中的核心变化。

## React 19 支持

Next.js 15 正式支持 React 19，带来以下改进：

- Server Components 成为默认
- 新的 Action 和 Form 组件
- 改进的 Suspense 支持

## App Router 改进

### 布局加载优化

新版 App Router 提供了更细粒度的加载控制。

### 缓存策略调整

\`\`\`typescript
// 新的缓存配置
fetch('', { cache: 'force-cache' })
\`\`\`

## Turbopack 改进

开发体验大幅提升，冷启动时间减少 50%。

## 总结

Next.js 15 标志着 React 全栈开发的成熟，值得深入学习。
    `,
  },
  "tailwind-css-4-guide": {
    title: "Tailwind CSS 4.0 完全指南",
    date: "2026-05-15",
    category: "技术",
    content: `
## 概述

Tailwind CSS 4.0 是一次重大版本更新，引入了全新的 @theme 语法。

## 核心变化

### 1. @theme 语法

\`\`\`css
@theme {
  --color-primary: #6366f1;
  --spacing: 0.5rem;
}
\`\`\`

### 2. 性能提升

CSS 生成速度提升 70%，包体积减少 30%。

## 迁移指南

从 v3 迁移到 v4 需要注意配置方式的变化。

## 最佳实践

合理组织 theme 配置，遵循原子化 CSS 原则。
    `,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: post.title,
    description: post.content.slice(0, 160),
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            文章未找到
          </h1>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <article className="max-w-3xl mx-auto">
        <header className="mb-10 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full">
              {post.category}
            </span>
            <time className="text-sm text-slate-500 dark:text-slate-400">
              {post.date}
            </time>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-lg dark:prose-invert max-w-none animate-fade-in-up animation-delay-100
            prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400
            prose-code:text-indigo-600 dark:prose-code:text-indigo-400
            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
            prose-pre:rounded-xl
            prose-li:text-slate-600 dark:prose-li:text-slate-300
          "
        >
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← 返回首页
          </Link>
        </footer>
      </article>
    </div>
  );
}
