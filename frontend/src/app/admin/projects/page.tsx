'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  stars: number;
  created_at: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tech: '',
    link: '',
    stars: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("获取项目失败:", error);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', tech: '', link: '', stars: 0 });
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      tech: project.tech.join(', '),
      link: project.link,
      stars: project.stars,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = formData.tech.split(',').map(t => t.trim()).filter(Boolean);
    const body = {
      name: formData.name,
      description: formData.description,
      tech: techArray,
      link: formData.link,
      stars: formData.stars,
    };

    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("保存项目失败:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个项目吗？")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) fetchProjects();
    } catch (error) {
      console.error("删除项目失败:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          项目管理
        </h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          新增项目
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-white/20 dark:border-white/10 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-slate-600 dark:text-slate-400">
            暂无项目，点击上方按钮新增
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {project.description}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => openEdit(project)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors truncate max-w-xs"
                  >
                    🔗 {project.link}
                  </a>
                )}
                <span>⭐ {project.stars} Stars</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 flex items-start justify-center pt-40 pb-8 px-4 overflow-y-auto z-[60] pointer-events-none">
          <div className="pointer-events-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20 dark:border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingProject ? '编辑项目' : '新增项目'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  项目名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="输入项目名称..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  rows={3}
                  placeholder="描述一下这个项目..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  技术栈（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={formData.tech}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="React, TypeScript, Node.js..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  链接
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stars
                </label>
                <input
                  type="number"
                  value={formData.stars}
                  onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "bg-white/50 dark:bg-slate-700/50",
                    "border-white/20 dark:border-white/10",
                    "text-slate-800 dark:text-white",
                    "focus:outline-none focus:border-indigo-500"
                  )}
                  min={0}
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
                  {editingProject ? '保存' : '创建'}
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
