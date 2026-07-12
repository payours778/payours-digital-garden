"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const p = await params;
      setId(parseInt(p.id));
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (id === null) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${id}`);
        if (!res.ok) {
          throw new Error("文章未找到");
        }
        const data = await res.json();
        setPost(data.post);
        setError(null);
      } catch (err) {
        setError("文章未找到");
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          文章未找到
        </h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
        >
          返回上一页
        </button>
      </div>
    );
  }

  const contentParagraphs = post.content.split("\n\n");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回文章归档
          </Link>
        </div>

        <article className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
          {post.cover && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.tags && post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-8">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.created_at)}
              </span>
              {post.updated_at && post.updated_at !== post.created_at && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  更新于 {formatDate(post.updated_at)}
                </span>
              )}
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.views || 0} 阅读
              </span>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {contentParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">博主</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">记录生活与思考</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    分享
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    喜欢
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}