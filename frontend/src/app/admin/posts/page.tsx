'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  cover: string;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    cover: '',
    tags: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("获取文章失败:", error);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', excerpt: '', slug: '', cover: '', tags: '' });
    setShowModal(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug,
      cover: post.cover,
      tags: post.tags.join(', '),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const body = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      slug: formData.slug,
      cover: formData.cover,
      tags: tagsArray,
    };

    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
      const method = editingPost ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存文章失败:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这篇文章吗？")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error("删除文章失败:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          文章管理
        </h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          新增文章
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-white/20 dark:border-white/10 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-slate-600 dark:text-slate-400">
            暂无文章，点击上方按钮新增
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => openEdit(post)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-medium bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>📅 {formatDate(post.created_at)}</span>
                <span>👁 {post.views} 次浏览</span>
                <span className="truncate">🔗 /{post.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 flex items-start justify-center pt-40 pb-8 px-4 overflow-y-auto z-[60] pointer-events-none">
          <div className="pointer-events-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-lg border border-white/20 dark:border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingPost ? '编辑文章' : '新增文章'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="输入文章标题..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Slug（URL 标识，唯一）
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="my-first-post"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  摘要
                </label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="一句话概括文章内容..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  正文
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  rows={6}
                  placeholder="支持 Markdown 格式..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  封面图 URL
                </label>
                <input
                  type="url"
                  value={formData.cover}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="https://..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="Leetcode, C++, 算法..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingPost ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
