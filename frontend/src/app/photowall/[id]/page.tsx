"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Album {
  id: number;
  name: string;
  description: string;
  cover_url: string;
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

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = parseInt(params.id as string);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/albums/${albumId}`);
        if (res.ok) {
          const data = await res.json();
          setAlbum(data.album);
          setPhotos(data.album?.photos || []);
        } else {
          setAlbum(null);
        }
      } catch (error) {
        console.error("获取相册失败:", error);
        setAlbum(null);
      }
      setIsLoading(false);
    };
    if (!isNaN(albumId)) fetchAlbum();
  }, [albumId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">相册不存在</h1>
          <Link
            href="/photowall"
            className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
          >
            返回照片墙
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative pt-36 pb-8 px-4">
        <div className="relative max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {album.name}
            </h1>
            {album.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {album.description}
              </p>
            )}
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              共 {photos.length} 张照片
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {photos.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="text-5xl mb-4">📷</div>
              <p>这个相册还没有照片</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer group"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.description}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.description && (
                    <div className="p-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{photo.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.description}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            {lightboxPhoto.description && (
              <p className="text-center text-white/80 text-sm mt-3">{lightboxPhoto.description}</p>
            )}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
