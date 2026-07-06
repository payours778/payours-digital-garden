"use client";

import { useState, useEffect } from "react";

interface Album {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  photo_count: number;
  created_at: string;
  photos?: Photo[];
}

interface Photo {
  id: number;
  album_id: number;
  url: string;
  description: string;
  created_at: string;
}

export default function AdminPhotos() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  const [albumForm, setAlbumForm] = useState({
    name: "",
    description: "",
    cover_url: "",
  });

  const [photoForm, setPhotoForm] = useState({
    url: "",
    description: "",
  });

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("获取相册失败:", error);
    }
    setIsLoading(false);
  };

  const fetchAlbumDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/albums/${id}`);
      const data = await res.json();
      setCurrentAlbum(data.album);
    } catch (error) {
      console.error("获取相册详情失败:", error);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleSaveAlbum = async () => {
    if (!albumForm.name) {
      alert("请输入相册名称");
      return;
    }

    try {
      const url = editingAlbum
        ? `/api/albums/${editingAlbum.id}`
        : "/api/albums";
      const method = editingAlbum ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumForm),
      });

      if (res.ok) {
        setShowAlbumForm(false);
        setEditingAlbum(null);
        setAlbumForm({ name: "", description: "", cover_url: "" });
        fetchAlbums();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存相册失败:", error);
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setAlbumForm({
      name: album.name,
      description: album.description || "",
      cover_url: album.cover_url || "",
    });
    setShowAlbumForm(true);
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm("确定删除此相册？相册内所有照片也会被删除。")) return;

    try {
      const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAlbums();
        if (currentAlbum?.id === id) {
          setCurrentAlbum(null);
        }
      }
    } catch (error) {
      console.error("删除相册失败:", error);
    }
  };

  const handleAddPhoto = async () => {
    if (!photoForm.url || !currentAlbum) {
      alert("请输入照片URL");
      return;
    }

    try {
      const res = await fetch(`/api/albums/${currentAlbum.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: [{ url: photoForm.url, description: photoForm.description }],
        }),
      });

      if (res.ok) {
        setShowPhotoForm(false);
        setPhotoForm({ url: "", description: "" });
        fetchAlbumDetail(currentAlbum.id);
        fetchAlbums();
      }
    } catch (error) {
      console.error("添加照片失败:", error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!currentAlbum) return;
    if (!confirm("确定删除此照片？")) return;

    try {
      const res = await fetch(`/api/photos/photos/${photoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAlbumDetail(currentAlbum.id);
        fetchAlbums();
      }
    } catch (error) {
      console.error("删除照片失败:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          加载中...
        </div>
      </div>
    );
  }

  // 相册详情视图
  if (currentAlbum) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setCurrentAlbum(null)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 mb-2 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回相册列表
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {currentAlbum.name}
            </h2>
            {currentAlbum.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentAlbum.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowPhotoForm(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加照片
          </button>
        </div>

        {currentAlbum.photos && currentAlbum.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentAlbum.photos.map((photo) => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-square">
                <img src={photo.url} alt={photo.description} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    title="删除照片"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {photo.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                    {photo.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <div className="text-5xl mb-4">📷</div>
            <p>这个相册还没有照片</p>
          </div>
        )}

        {/* 添加照片弹窗 */}
        {showPhotoForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPhotoForm(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">添加照片</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    照片URL
                  </label>
                  <input
                    type="text"
                    value={photoForm.url}
                    onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    描述
                  </label>
                  <input
                    type="text"
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    placeholder="照片描述（可选）"
                  />
                </div>
                {photoForm.url && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">预览：</p>
                    <img src={photoForm.url} alt="预览" className="w-full h-40 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowPhotoForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPhoto}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 相册列表视图
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">照片管理</h2>
        <button
          onClick={() => {
            setEditingAlbum(null);
            setAlbumForm({ name: "", description: "", cover_url: "" });
            setShowAlbumForm(true);
          }}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建相册
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-slate-600 dark:text-slate-400">还没有相册，点击右上角创建一个吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 cursor-pointer"
                onClick={() => fetchAlbumDetail(album.id)}
              >
                {album.cover_url ? (
                  <img src={album.cover_url} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate">{album.name}</h3>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {album.photo_count} 张
                  </span>
                </div>
                {album.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {album.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchAlbumDetail(album.id)}
                    className="flex-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => handleEditAlbum(album)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 相册表单弹窗 */}
      {showAlbumForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAlbumForm(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
              {editingAlbum ? "编辑相册" : "新建相册"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  相册名称
                </label>
                <input
                  type="text"
                  value={albumForm.name}
                  onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  placeholder="相册名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  描述
                </label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  rows={3}
                  placeholder="相册描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  封面URL
                </label>
                <input
                  type="text"
                  value={albumForm.cover_url}
                  onChange={(e) => setAlbumForm({ ...albumForm, cover_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  placeholder="https://..."
                />
              </div>
              {albumForm.cover_url && (
                <img src={albumForm.cover_url} alt="封面预览" className="w-full h-32 object-cover rounded-lg" />
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAlbumForm(false);
                  setEditingAlbum(null);
                }}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveAlbum}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
              >
                {editingAlbum ? "保存" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
