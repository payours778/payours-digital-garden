"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface AdminUser {
  id: number;
  username: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface ListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "管理员",
  user: "普通用户",
};

const emptyForm = {
  username: "",
  password: "",
  phone: "",
  role: "user",
};

export default function AdminUsersPage() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const data = (await apiGet(`/api/users/admin?${params.toString()}`)) as ListResponse;
      setList(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 打开新建表单
  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  };

  // 打开编辑表单
  const openEdit = (item: AdminUser) => {
    setForm({
      username: item.username,
      password: "",
      phone: item.phone || "",
      role: item.role,
    });
    setIsEditing(true);
    setEditingId(item.id);
    setShowForm(true);
  };

  // 查看详情
  const openDetail = async (id: number) => {
    try {
      const data = await apiGet(`/api/users/admin/${id}`);
      setDetail((data as any).user || null);
      setDetailId(id);
    } catch (err) {
      alert((err as Error).message || "获取用户详情失败");
    }
  };

  // 提交表单（新建 / 编辑）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await apiPut(`/api/users/admin/${editingId}`, form);
      } else {
        await apiPost("/api/users/admin", form);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.message || "操作失败";
      // api 层错误可能是 {error: '...'} 对象
      if (msg) alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (item: AdminUser) => {
    const which = `${item.username}（${ROLE_LABEL[item.role] || item.role}）`;
    if (!confirm(`确定要删除用户「${which}」吗？此操作不可恢复。`)) return;
    try {
      await apiDelete(`/api/users/admin/${item.id}`);
      alert("删除成功");
      fetchUsers();
    } catch (err) {
      const msg = (err as Error).message || "删除失败";
      alert(typeof msg === "string" ? msg : "删除失败");
    }
  };

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">用户管理</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            共 {total} 位用户 · 仅管理员可操作
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 新增用户
        </button>
      </div>

      {/* 搜索 + 筛选 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索用户名或手机号..."
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
        >
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="user">普通用户</option>
        </select>
      </div>

      {/* 新增 / 编辑表单 */}
      {showForm && (
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            {isEditing ? "编辑用户" : "新增用户"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  disabled={isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  密码
                  {isEditing ? (
                    <span className="text-xs text-slate-400">（留空则不修改）</span>
                  ) : (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!isEditing}
                  placeholder={isEditing ? "不修改请留空" : "至少 6 位"}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  手机号
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="选填"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  角色
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? "保存修改" : "创建用户"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 详情弹窗 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDetail(null)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">用户详情</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">ID</span>
                <span className="text-slate-800 dark:text-white">{detail.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">用户名</span>
                <span className="text-slate-800 dark:text-white">{detail.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">手机号</span>
                <span className="text-slate-800 dark:text-white">{detail.phone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">角色</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    detail.role === "admin"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  )}
                >
                  {ROLE_LABEL[detail.role] || detail.role}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500 dark:text-slate-400">创建时间</span>
                <span className="text-slate-800 dark:text-white">
                  {detail.created_at ? new Date(detail.created_at).toLocaleString() : "—"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => {
                  openEdit(detail);
                  setDetail(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                编辑
              </button>
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* 表格 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-left text-slate-600 dark:text-slate-300">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">用户名</th>
                  <th className="px-4 py-3 font-medium">手机号</th>
                  <th className="px-4 py-3 font-medium">角色</th>
                  <th className="px-4 py-3 font-medium">创建时间</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                      {item.username}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          item.role === "admin"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        )}
                      >
                        {ROLE_LABEL[item.role] || item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openDetail(item.id)}
                          className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      暂无用户
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                第 {page} / {pages} 页 · 共 {total} 条
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}