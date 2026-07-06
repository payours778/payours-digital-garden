"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Album {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  photo_count: number;
  created_at: string;
}

export default function PhotowallPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/albums");
        const data = await res.json();
        setAlbums(data.albums || []);
      } catch (error) {
        console.error("获取相册列表失败:", error);
      }
      setIsLoading(false);
    };
    fetchAlbums();
  }, []);

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            照片墙
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            用镜头记录生活的美好瞬间
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">加载中...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <div className="text-5xl mb-4">📷</div>
            <p>还没有相册</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
            {albums.map((album, index) => (
              <Link
                key={album.id}
                href={`/photowall/${album.id}`}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 animate-fade-in-up cursor-pointer block"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg mb-1">{album.name}</h3>
                  {album.description && (
                    <p className="text-white/80 text-sm line-clamp-2">{album.description}</p>
                  )}
                  <p className="text-white/60 text-xs mt-1">{album.photo_count} 张照片</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
