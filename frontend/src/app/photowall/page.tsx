"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Photo {
  id: number;
  album_id: number;
  url: string;
  description: string;
  created_at: string;
}

interface Album {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  photo_count: number;
  created_at: string;
  photos?: Photo[];
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
        
        const albumsWithPhotos = await Promise.all(
          (data.albums || []).map(async (album: Album) => {
            const photoRes = await fetch(`/api/albums/${album.id}`);
            const photoData = await photoRes.json();
            return {
              ...album,
              photos: photoData.album?.photos || [],
            };
          })
        );
        
        setAlbums(albumsWithPhotos);
      } catch (error) {
        console.error("获取相册列表失败:", error);
      }
      setIsLoading(false);
    };
    fetchAlbums();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="pt-28 pb-16 px-4 min-h-screen relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-2">
              光影画廊
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wider">
              定格时间，封存生活的每一次心跳
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">加载中...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <div className="text-5xl mb-4">📷</div>
            <p>还没有相册</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 mt-10">
            {albums.map((album) => (
              <div key={album.id} className="group cursor-pointer flex flex-col items-center">
                <div className="relative w-[85%] aspect-[4/3] mb-8">
                  <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 rounded-[4px] shadow-md transform rotate-6 translate-x-4 translate-y-2 group-hover:rotate-12 group-hover:translate-x-8 transition-all duration-500 border-[6px] border-white dark:border-slate-200 overflow-hidden opacity-60 z-0">
                    {album.photos && album.photos.length > 0 && (
                      <img
                        src={album.photos[0].url}
                        alt=""
                        className="w-full h-full object-cover grayscale blur-[2px]"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-600 rounded-[4px] shadow-lg transform -rotate-3 -translate-x-2 -translate-y-1 group-hover:-rotate-6 group-hover:-translate-x-6 transition-all duration-500 border-[6px] border-white dark:border-slate-200 overflow-hidden opacity-80 z-10">
                    {album.photos && album.photos.length > 0 && (
                      <img
                        src={album.photos[0].url}
                        alt=""
                        className="w-full h-full object-cover grayscale-[50%]"
                      />
                    )}
                  </div>
                  <Link href={`/photowall/${album.id}`} className="absolute inset-0 z-20">
                    <div className="absolute inset-0 bg-white dark:bg-slate-200 rounded-[4px] shadow-2xl border-[6px] border-white dark:border-slate-200 overflow-hidden transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 relative">
                      {album.photos && album.photos.length > 0 ? (
                        <img
                          src={album.photos[0].url}
                          alt={album.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                        <span className="text-white font-bold text-lg drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          {album.photo_count} 张照片
                        </span>
                        <span className="text-indigo-300 font-medium text-xs mt-1 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          Click to Open
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="text-center px-4 w-full">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Link
                      href={`/photowall/${album.id}`}
                      className="text-xl font-bold text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    >
                      {album.name}
                    </Link>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {formatDate(album.created_at)}
                    </span>
                  </div>
                  {album.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {album.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}