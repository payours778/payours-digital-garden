'use client';

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const EMOJI_LIST = [
  "😀", "😂", "🤣", "😊", "😍", "🥰", "😘", "😎", "🤩", "🥳",
  "😢", "😭", "😤", "😡", "🤔", "🤗", "🤭", "🫣", "😴", "🥱",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "✌️", "🤞", "🫶", "❤️",
  "🔥", "⭐", "🌈", "🌸", "🍀", "🎉", "🎊", "💯", "✨", "💫",
  "☀️", "🌙", "🌍", "🎵", "🎶", "📷", "💬", "💭", "🏠", "🚀",
];

interface Moment {
  id: number;
  content: string;
  images: string[];
  likes: number;
  created_at: string;
}

export default function AdminMoments() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMoment, setCurrentMoment] = useState<Moment | null>(null);
  const [formData, setFormData] = useState({ content: "", images: [""] });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.slice(0, start) + emoji + formData.content.slice(end);
      setFormData({ ...formData, content: newContent });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setFormData({ ...formData, content: formData.content + emoji });
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/moments");
      const data = await res.json();
      setMoments(data.moments || []);
    } catch (error) {
      console.error("获取说说失败:", error);
    }
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.content,
          images: formData.images.filter((img) => img.trim()),
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setShowEmojiPicker(false);
        setFormData({ content: "", images: [""] });
        fetchMoments();
      }
    } catch (error) {
      console.error("创建说说失败:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMoment) return;
    try {
      const res = await fetch(`/api/moments/${currentMoment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.content,
          images: formData.images.filter((img) => img.trim()),
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        setShowEmojiPicker(false);
        setCurrentMoment(null);
        setFormData({ content: "", images: [""] });
        fetchMoments();
      }
    } catch (error) {
      console.error("更新说说失败:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条说说吗？")) return;
    try {
      const res = await fetch(`/api/moments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMoments();
      }
    } catch (error) {
      console.error("删除说说失败:", error);
    }
  };

  const openEditModal = (moment: Moment) => {
    setCurrentMoment(moment);
    setFormData({ content: moment.content, images: [...moment.images, ""] });
    setShowEditModal(true);
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length <= 1) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          说说管理
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          发布说说
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : moments.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-white/20 dark:border-white/10 text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-slate-600 dark:text-slate-400">
            暂无说说，点击上方按钮发布
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/10"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {moment.created_at}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(moment)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(moment.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <p className="text-slate-800 dark:text-white mb-3">
                {moment.content}
              </p>
              {moment.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {moment.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span>❤️</span>
                <span>{moment.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted && showCreateModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-[60] pointer-events-none">
          <div className="pointer-events-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20 dark:border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              发布说说
            </h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  内容
                </label>
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  rows={4}
                  placeholder="写下你想说的..."
                  required
                />
                <div ref={emojiPickerRef} className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    😊 表情
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-full mt-1 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-10 w-[320px]">
                      <div className="grid grid-cols-10 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  图片 URL（可选，支持多张）
                </label>
                <div className="space-y-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-lg border",
                          "bg-white/50 dark:bg-slate-700/50",
                          "border-white/20 dark:border-white/10",
                          "text-slate-800 dark:text-white",
                          "focus:outline-none focus:border-indigo-500"
                        )}
                        placeholder="https://..."
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="w-full px-4 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    + 添加图片
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setShowEmojiPicker(false); }}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {mounted && showEditModal && currentMoment && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-[60] pointer-events-none">
          <div className="pointer-events-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20 dark:border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              编辑说说
            </h3>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  内容
                </label>
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  rows={4}
                  required
                />
                <div ref={emojiPickerRef} className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    😊 表情
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-full mt-1 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-10 w-[320px]">
                      <div className="grid grid-cols-10 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  图片 URL（可选，支持多张）
                </label>
                <div className="space-y-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-lg border",
                          "bg-white/50 dark:bg-slate-700/50",
                          "border-white/20 dark:border-white/10",
                          "text-slate-800 dark:text-white",
                          "focus:outline-none focus:border-indigo-500"
                        )}
                        placeholder="https://..."
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="w-full px-4 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    + 添加图片
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setShowEmojiPicker(false);
                    setCurrentMoment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  保存
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