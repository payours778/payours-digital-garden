import { Metadata } from "next";

export const metadata: Metadata = {
  title: "照片墙",
  description: "摄影作品集",
};

const photos = [
  { id: 1, src: "https://picsum.photos/seed/japan1/800/600", alt: "东京街头" },
  { id: 2, src: "https://picsum.photos/seed/japan2/600/800", alt: "京都古巷" },
  { id: 3, src: "https://picsum.photos/seed/nature1/800/800", alt: "山林晨雾" },
  { id: 4, src: "https://picsum.photos/seed/city1/800/600", alt: "城市夜景" },
  { id: 5, src: "https://picsum.photos/seed/food1/600/600", alt: "美食" },
  { id: 6, src: "https://picsum.photos/seed/travel1/800/600", alt: "旅行" },
  { id: 7, src: "https://picsum.photos/seed/coffee1/600/800", alt: "咖啡时光" },
  { id: 8, src: "https://picsum.photos/seed/sunset1/800/600", alt: "日落" },
];

export default function PhotowallPage() {
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-sm font-medium">{photo.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
