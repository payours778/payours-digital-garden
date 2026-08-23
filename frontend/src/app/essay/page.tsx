"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Essay {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

const essays: Essay[] = [
  { id: 1, title: "渔", excerpt: "渝北我去过两次，一次是去钓鱼，另一次还是去钓鱼...", date: "2025-06-30", image: "/essay/covers/fishing.jpg" },
  { id: 2, title: "月", excerpt: "舰船在海上静静地飘，无垠的海空荡荡，到了晚上一点光亮也没有...", date: "2025-04-28", image: "/essay/covers/moon.jpg" },
  { id: 3, title: "春", excerpt: "春天的时候，我第一次登上这座岛屿...", date: "2024-11-08", image: "/essay/covers/spring.jpg" },
  { id: 4, title: "雪围巾", excerpt: "母亲临近过年的时候闲下来，突然想织毛线。她找出来很久没有用过的长针问我说，这个冬天要降温了，要不要给我织一件毛衣，我说我想要一条围巾...", date: "2024-06-29", image: "/essay/covers/snow-scarf.jpg" },
  { id: 5, title: "花", excerpt: "那天下午我什么事都没干，找丁真借了一件体面了衣服，把一朵花插在兜里出发了...", date: "2024-07-03", image: "/essay/covers/flower.jpg" },
  { id: 6, title: "冬", excerpt: "柳暮生日那天，我起得很晚...", date: "2024-06-09", image: "/essay/covers/winter.jpg" },
  { id: 7, title: "山", excerpt: "小时候，每逢黄昏，我总爱去自家屋顶院子里逛逛，祖父的苦瓜藤长得很高，把架子编织的像帐篷一样...", date: "2023-10-25", image: "/essay/covers/mountain.jpg" },
  { id: 8, title: "墓碑", excerpt: "小的时候去山头，给老一辈的祖宗上坟挂清，我一直都记得，大家其乐融融的样子...", date: "2023-05-21", image: "/essay/covers/tombstone.jpg" },
];

const CN_DIGITS = "〇一二三四五六七八九";
function cn(num: string): string {
  return num.replace(/\d/g, (d) => CN_DIGITS[Number(d)]);
}
const MONTHS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const DAYS = [
  "", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十", "三十一",
];
function fmtDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${cn(m[1])}年${MONTHS[Number(m[2])]}月${DAYS[Number(m[3])]}日`;
}

const essayCss = `
.essay-journal{
  --mag-accent:#ff4d1c;
  --mag-accent-h:#e6430f;
  --mag-ink:#16161a;
  --mag-ink-soft:#4a4a55;
  --mag-ink-faint:#6e6e78;
  --mag-line:rgba(22,22,26,.18);
  --mag-line-soft:rgba(22,22,26,.08);
  --mag-page-bg:rgba(255,255,255,.5);
  --mag-surface:rgba(255,255,255,.85);
  --mag-surface-hover:#fff;
  --mag-art:#2563eb;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
}
.dark .essay-journal{
  --mag-accent:#ff5a2e;
  --mag-accent-h:#ff6a40;
  --mag-ink:#f2f2f2;
  --mag-ink-soft:#c8c8d0;
  --mag-ink-faint:#9a9aa2;
  --mag-line:rgba(242,242,242,.18);
  --mag-line-soft:rgba(242,242,242,.08);
  --mag-page-bg:rgba(18,18,24,.45);
  --mag-surface:rgba(18,18,24,.82);
  --mag-surface-hover:rgba(28,28,36,.98);
}
.essay-journal{
  color:var(--mag-ink);
  font-family:"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif;
}
.mk-kicker{display:flex;align-items:center;gap:12px;font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.34em;color:var(--mag-accent);text-transform:uppercase}
.mk-kicker::before{content:"";width:40px;height:2px;background:var(--mag-accent)}
.mk-headline{font-family:"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif;font-weight:800;font-size:clamp(40px,5.6vw,64px);line-height:1.04;letter-spacing:-.01em;color:var(--mag-ink)}
.mk-headline .hl{color:var(--mag-accent)}
.mk-lead{margin-top:20px;color:var(--mag-ink-soft);font-size:15.5px;line-height:1.85}
.mk-meta{display:flex;flex-wrap:wrap;gap:16px 28px;margin-top:24px;font-family:var(--sans);font-size:13px;color:var(--mag-ink-faint);letter-spacing:.08em}
.mk-meta b{color:var(--mag-ink);font-weight:600}
.mk-cta{margin-top:28px;display:inline-flex;align-items:center;gap:10px;font-family:var(--sans);font-size:14px;font-weight:700;color:var(--mag-accent);letter-spacing:.02em}
.mk-page{background:var(--mag-page-bg);border:1px solid var(--mag-line);border-radius:10px;padding:48px 56px;box-shadow:0 8px 24px -12px rgba(0,0,0,.18)}
.mk-featured{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;padding:8px 0 12px}
.mk-art{position:relative;min-height:340px;border-radius:8px;overflow:hidden;background:#0b2433}
.mk-art .mk-art-bg{position:absolute;inset:0;background:#0b2433;z-index:0}
.mk-art img.cov{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(2px);transform:scale(1.03)}
.mk-art .fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.35) 35%,transparent 70%);z-index:1}
.mk-art .num{position:absolute;top:20px;left:22px;font-family:var(--sans);font-weight:800;font-size:13px;letter-spacing:.2em;color:rgba(255,255,255,.85);z-index:3}
.mk-art .big{position:absolute;inset:0;display:grid;place-items:center;font-family:"Noto Serif SC","Source Han Serif SC",serif;font-size:clamp(140px,20vw,250px);font-weight:800;color:rgba(255,255,255,.16)}
.mk-art .cap{position:absolute;bottom:64px;left:22px;right:22px;color:rgba(255,255,255,.85);font-family:var(--sans);font-size:12px;letter-spacing:.16em;z-index:3;text-align:right}
.mk-art .mk-art-text{position:absolute;left:22px;right:22px;bottom:22px;z-index:2;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.45)}
.mk-art .mk-art-text .title{font-family:"Noto Serif SC","Source Han Serif SC",serif;font-size:22px;font-weight:800;line-height:1.2;margin-bottom:6px}
.mk-art .mk-art-text .excerpt{font-size:12.5px;line-height:1.6;opacity:.88;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

@keyframes mk-img-in{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
@keyframes mk-img-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.04)}}
.mk-art img.cov.img-in{animation:mk-img-in .45s ease-out both}
.mk-art img.cov.img-out{animation:mk-img-out .45s ease-in both}
.mk-art .mk-art-text.img-in{animation:mk-img-in .45s ease-out both}
.mk-art .mk-art-text.img-out{animation:mk-img-out .45s ease-in both}
.mk-lab{display:flex;align-items:baseline;justify-content:space-between;margin:46px 0 22px}
.mk-lab h2{font-family:"Noto Serif SC",serif;font-size:22px;font-weight:800;color:var(--mag-ink)}
.mk-lab span{font-family:var(--sans);font-size:12px;letter-spacing:.3em;color:var(--mag-ink-faint)}
.mk-masonry{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.mk-card{display:flex;flex-direction:column;break-inside:avoid;border:1px solid var(--mag-line);border-radius:8px;overflow:hidden;background:var(--mag-surface);transition:.3s;box-shadow:0 4px 14px -6px rgba(0,0,0,.18)}
.mk-card:hover{transform:translateY(-3px);border-color:var(--mag-accent);box-shadow:0 22px 44px -28px rgba(0,0,0,.4)}
.mk-card .art{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:#0b2433;flex-shrink:0}
.mk-card .art img.cov{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.mk-card .body{padding:18px 20px 20px;flex:1;display:flex;flex-direction:column}
.mk-tags{display:flex;gap:8px;margin-bottom:12px}
.mk-chip{font-family:var(--sans);font-size:11px;letter-spacing:.08em;padding:4px 10px;border:1px solid var(--mag-line);border-radius:999px;color:var(--mag-ink-soft)}
.mk-chip.hot{background:var(--mag-accent);border-color:var(--mag-accent);color:#fff}
.mk-card h3{font-family:"Noto Serif SC",serif;font-size:20px;font-weight:800;line-height:1.25;color:var(--mag-ink)}
.mk-card p{margin-top:9px;color:var(--mag-ink-soft);font-size:13.5px;line-height:1.75;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.mk-card .meta{margin-top:14px;font-family:var(--sans);font-size:12px;color:var(--mag-ink-faint);letter-spacing:.1em;display:flex;justify-content:space-between;gap:8px}
.mk-foot{display:flex;align-items:center;justify-content:space-between;padding:28px 0 6px;border-top:1px solid var(--mag-line-soft);margin-top:10px}

@keyframes essay-toast-in{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes essay-toast-out{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)}}
.essay-toast{animation:essay-toast-in .28s cubic-bezier(.22,.61,.36,1) both}
.mk-quote{font-family:"Noto Serif SC",serif;color:var(--mag-ink-soft);font-size:15px}
.mk-quote em{color:var(--mag-accent);font-style:normal}
.mk-again{font-family:var(--sans);font-size:13px;font-weight:700;letter-spacing:.04em;padding:9px 18px;border-radius:999px;background:var(--mag-ink);color:#fff;cursor:pointer;border:none;transition:.25s}
.mk-again:hover{background:var(--mag-accent);color:#fff}
@media(max-width:1100px){
  .mk-masonry{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
}
@media(max-width:860px){
  .mk-featured{grid-template-columns:1fr;gap:26px}
  .mk-art{min-height:210px;order:-1}
  .mk-masonry{grid-template-columns:1fr}
  .mk-page{padding:28px 22px}
}
`;

export default function EssayPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [imgFading, setImgFading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setFading(false);
    const outT = setTimeout(() => setFading(true), 1800);
    const rmT = setTimeout(() => { setToast(null); setFading(false); }, 2200);
    return () => { clearTimeout(outT); clearTimeout(rmT); };
  }, [toast]);

  useEffect(() => {
    if (essays.length <= 1) return;
    const id = setInterval(() => {
      setImgFading(true);
      setTimeout(() => {
        setFeaturedIdx((i) => (i + 1) % essays.length);
        setImgFading(false);
      }, 450);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/essay");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const featured = essays[0];
  const rest = essays.slice(1);
  const readTime = (excerpt: string) => Math.max(1, Math.round(excerpt.length / 60));

  return (
    <div className="essay-journal min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <style dangerouslySetInnerHTML={{ __html: essayCss }} />
      <div className="max-w-5xl mx-auto mk-page">
        <div className="mk-featured">
          <div>
            <div className="mk-kicker">Essay Journal · 浮生手记</div>
            <h1 className="mk-headline mt-5">
              我有一个
              <br />
              <span className="hl">文青梦</span>
            </h1>
            <p className="mk-lead">
              几年里偶尔写下的几段，多数是写给自己看的，留在这里只是因为——也许多年以后，谁又会坐在炉子旁，想起来这些，又会成为谁茶余饭后的谈笑。
            </p>
            <div className="mk-meta">
              <span><b>{essays.length}</b> 篇</span>
              <span><b>2025</b> 年</span>
              <span>副刊 · 散文</span>
            </div>
            <Link href={`/essay/${featured.id}`} className="mk-cta">
              开始阅读 →
            </Link>
          </div>
          <div className="mk-art">
            <div className="mk-art-bg" />
            <img
              key={essays[featuredIdx].id}
              src={essays[featuredIdx].image}
              alt={essays[featuredIdx].title}
              className={`cov ${imgFading ? "img-out" : "img-in"}`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span className="fade" />
            <span className="num">
              NO.{(featuredIdx + 1).toString().padStart(2, "0")}
            </span>
            <span className="cap">
              {fmtDate(essays[featuredIdx].date)} · {essays[featuredIdx].title}
            </span>
            <div className={`mk-art-text ${imgFading ? "img-out" : "img-in"}`}>
              <h3 className="title">{essays[featuredIdx].title}</h3>
              <p className="excerpt">{essays[featuredIdx].excerpt}</p>
            </div>
          </div>
        </div>

        <div className="mk-lab">
          <h2>本期目录</h2>
          <span>CONTENTS · 全部篇章</span>
        </div>

        <div className="mk-masonry">
          {rest.map((essay, i) => (
            <Link key={essay.id} href={`/essay/${essay.id}`} className="mk-card">
              <div className="art">
                <img src={essay.image} alt={essay.title} className="cov" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="body">
                <div className="mk-tags">
                  <span className="mk-chip hot">手记</span>
                  <span className="mk-chip">{essay.date.slice(0, 4)}</span>
                </div>
                <h3>{essay.title}</h3>
                <p>{essay.excerpt}</p>
                <div className="meta">
                  <span>{fmtDate(essay.date)}</span>
                  <span>约 {readTime(essay.excerpt)} 分钟</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mk-foot">
          <div className="mk-quote">写作是把日子过得再慢一点。 <em>—— 浮生手记</em></div>
          <button className="mk-again" onClick={() => setToast("敬请期待 ✨")}>
            查看更多
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{ left: "50%", top: "6rem" }}
          className={`fixed z-50 px-5 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-sm font-medium shadow-lg backdrop-blur-sm -translate-x-1/2 ${fading ? "essay-toast-out" : "essay-toast"}`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}


