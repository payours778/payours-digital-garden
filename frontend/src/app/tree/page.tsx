"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Gamepad2,
  Heart,
  Home,
  LayoutGrid,
  Lock,
  Play,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ==================== 游戏数据 ====================

type GameItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  tag: string;
  category: string;
  duration: string;
  status: "可玩" | "开发中";
  plays: string;
  playValue: number;
  rating: string;
  href: string;
};

const GAMES: GameItem[] = [
  {
    id: "farm",
    title: "灵境农场",
    description:
      "种植作物、合成稀有种子、与流浪商人交易，享受悠闲的田园生活，所有进度云端保存。",
    emoji: "🌾",
    gradient: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500",
    tag: "高分推荐",
    category: "休闲",
    duration: "10分钟",
    status: "可玩",
    plays: "3.8千",
    playValue: 3800,
    rating: "9.4",
    href: "/tree/farm",
  },
  {
    id: "fish",
    title: "摸鱼房间",
    description:
      "创建或加入一个摸鱼房间，和朋友一起开黑聊天的同时，享受轻松的休闲时间。",
    emoji: "🐟",
    gradient: "bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500",
    tag: "新游",
    category: "休闲",
    duration: "不限时",
    status: "可玩",
    plays: "1.2万",
    playValue: 12600,
    rating: "9.2",
    href: "/fish",
  },
  {
    id: "mosaic",
    title: "像素拼拼乐",
    description: "经典三消益智小游戏，连击释放大招，挑战排行榜高分。",
    emoji: "💎",
    gradient: "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500",
    tag: "经典",
    category: "益智",
    duration: "5分钟",
    status: "开发中",
    plays: "0",
    playValue: 60,
    rating: "—",
    href: "#",
  },
  {
    id: "tower",
    title: "梦境塔防",
    description: "放置防御塔守护你的水晶，波次越多奖励越丰厚。",
    emoji: "🏰",
    gradient: "bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500",
    tag: "挑战",
    category: "动作",
    duration: "20分钟",
    status: "开发中",
    plays: "0",
    playValue: 50,
    rating: "—",
    href: "#",
  },
  {
    id: "puzzle",
    title: "翻牌记忆",
    description: "经典卡片配对记忆游戏，训练记忆力，轻松治愈。",
    emoji: "🃏",
    gradient: "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500",
    tag: "亲子",
    category: "益智",
    duration: "2分钟",
    status: "开发中",
    plays: "0",
    playValue: 40,
    rating: "—",
    href: "#",
  },
  {
    id: "gacha",
    title: "灵境抽卡",
    description: "收集稀有卡片，解锁图鉴成就，召唤灵境守护。",
    emoji: "🎰",
    gradient: "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500",
    tag: "复古",
    category: "休闲",
    duration: "随机",
    status: "开发中",
    plays: "0",
    playValue: 30,
    rating: "—",
    href: "#",
  },
  {
    id: "block-puzzle",
    title: "方块拼图",
    description: "俄罗斯方块变体，经典永不褪色，挑战你的反应极限。",
    emoji: "🧱",
    gradient: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500",
    tag: "复古",
    category: "动作",
    duration: "3分钟",
    status: "开发中",
    plays: "0",
    playValue: 28,
    rating: "—",
    href: "#",
  },
  {
    id: "card-solitaire",
    title: "接龙大师",
    description: "经典纸牌接龙，支持撤销和自动提示。",
    emoji: "🃏",
    gradient: "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600",
    tag: "经典",
    category: "棋牌",
    duration: "6分钟",
    status: "开发中",
    plays: "0",
    playValue: 25,
    rating: "—",
    href: "#",
  },
  {
    id: "bubble",
    title: "泡泡射手",
    description: "瞄准并发射彩色泡泡，三个同色即可消除。",
    emoji: "🫧",
    gradient: "bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500",
    tag: "休闲",
    category: "益智",
    duration: "4分钟",
    status: "开发中",
    plays: "0",
    playValue: 22,
    rating: "—",
    href: "#",
  },
  {
    id: "forest-match",
    title: "森林消消",
    description: "交换相邻水果，帮助森林恢复生机。",
    emoji: "🌲",
    gradient: "bg-gradient-to-br from-lime-500 via-green-500 to-emerald-500",
    tag: "休闲",
    category: "益智",
    duration: "5分钟",
    status: "开发中",
    plays: "0",
    playValue: 20,
    rating: "—",
    href: "#",
  },
  {
    id: "sudoku",
    title: "数独星空",
    description: "经典数独规则，配合星空主题与难度递进。",
    emoji: "🔢",
    gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600",
    tag: "烧脑",
    category: "益智",
    duration: "10分钟",
    status: "开发中",
    plays: "0",
    playValue: 18,
    rating: "—",
    href: "#",
  },
  {
    id: "ball-break",
    title: "弹球突围",
    description: "拖动挡板击碎砖块，收集掉落的能力球。",
    emoji: "🏓",
    gradient: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
    tag: "挑战",
    category: "动作",
    duration: "3分钟",
    status: "开发中",
    plays: "0",
    playValue: 15,
    rating: "—",
    href: "#",
  },
];

type SortKey = "popular" | "rating" | "newest";

const FEATURED_IDS = GAMES.filter((g) => g.status === "可玩").map((g) => g.id);
const AUTO_PLAY_INTERVAL = 3000;

const CATEGORIES = ["all", "休闲", "益智", "动作", "棋牌"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  all: "全部",
  休闲: "休闲",
  益智: "益智",
  动作: "动作",
  棋牌: "棋牌",
};

const SORT_LABELS: Record<SortKey, string> = {
  popular: "人气优先",
  rating: "评分优先",
  newest: "最新上架",
};

// ==================== 徽章颜色映射 ====================
const categoryBadgeClass: Record<string, string> = {
  休闲: "badge-amber",
  益智: "badge-violet",
  动作: "badge-rose",
  棋牌: "badge-emerald",
};

const tagBadgeClass: Record<string, string> = {
  新游: "badge-primary",
  高分推荐: "badge-amber",
  经典: "badge-emerald",
  烧脑: "badge-violet",
  复古: "badge-amber",
  亲子: "badge-sky",
  挑战: "badge-rose",
  创意: "badge-violet",
  休闲: "badge-sky",
};

function getCategoryBadge(cat: string) {
  return categoryBadgeClass[cat] ?? "badge-sky";
}
function getTagBadge(tag: string) {
  return tagBadgeClass[tag] ?? "badge-primary";
}

// ==================== 页面 ====================

export default function LingjingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [listView, setListView] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openGame = (id: string) => {
    const g = GAMES.find((x) => x.id === id);
    if (g && g.href !== "#") router.push(g.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 rounded-3xl p-10 border border-white/20 dark:border-white/10 shadow-2xl max-w-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
            需要登录才能进入灵境
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            登录后即可游玩灵境中的小游戏，你的进度会自动保存到云端
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-4 h-4" />
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lingjing-root">
      <main id="main-content">
        <Hero
          user={user}
          category={category}
          setCategory={setCategory}
          openGame={openGame}
          favorites={favorites}
        />
        <QuickStrip />
        <div className="content-shell">
          <Sidebar
            category={category}
            setCategory={setCategory}
            openGame={openGame}
          />
          <GameGrid
            category={category}
            sort={sort}
            setSort={setSort}
            listView={listView}
            toggleListView={() => setListView((v) => !v)}
            openGame={openGame}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

// ==================== Hero ====================

interface HeroProps {
  user: { username: string };
  category: string;
  setCategory: (c: string) => void;
  openGame: (id: string) => void;
  favorites: string[];
}

function Hero({ user, category, setCategory, openGame, favorites }: HeroProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const indexRef = useRef(heroIndex);
  indexRef.current = heroIndex;

  const featured = FEATURED_IDS.map((id) => GAMES.find((g) => g.id === id)!).filter(Boolean);
  const total = featured.length;
  const game = featured[heroIndex] ?? featured[0];

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((indexRef.current + 1) % total);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(t);
  }, [isPaused, total]);

  const moveHero = (dir: number) =>
    setHeroIndex((heroIndex + dir + total) % total);

  const scrollToGrid = () => {
    document.getElementById("gameSection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" aria-label="精选游戏">
      <div className="hero-wrap">
        <div className="hero-top">
          {/* 左列 */}
          <div className="hero-left">
            <div className="hero-welcome">
              <div className="hero-welcome-inner">
                <div className="hero-welcome-top">
                  <span className="hero-kicker-wrap">
                    <span className="hero-kicker">
                      <Sparkles className="icon" aria-hidden="true" />
                      <span>欢迎来到灵境，{user.username}</span>
                    </span>
                  </span>
                </div>

                <div className="hero-title-block">
                  <h1>
                    精选轻量小游戏 · 随手就能玩
                    <br />
                    治愈每一段碎片时间
                  </h1>
                  <p className="hero-subtitle">
                    收录 {GAMES.length} 款休闲、益智、动作、棋牌精品，所有游戏开箱即玩，
                    无需下载，数据自动云端保存。快来找到你的下一款心头好！
                  </p>

                  <div className="hero-cta">
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={scrollToGrid}
                    >
                      <Gamepad2 className="icon" aria-hidden="true" />
                      立即开玩
                    </button>
                    <Link
                      href="/"
                      className="icon-btn-social"
                      aria-label="返回博客首页"
                      title="返回博客首页"
                    >
                      <Home className="icon" />
                    </Link>
                    <button
                      className="icon-btn-social"
                      type="button"
                      aria-label="每日推荐"
                      title="每日推荐"
                      style={{
                        background: "var(--success-soft)",
                        color: "var(--success-700)",
                      }}
                      onClick={() => {
                        const playable = GAMES.filter((g) => g.status === "可玩");
                        const pick = playable[Math.floor(Math.random() * playable.length)];
                        if (pick && pick.href !== "#") openGame(pick.id);
                      }}
                    >
                      <Zap className="icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷按钮网格：3列+2跨列 */}
            <div className="hero-quick-grid" aria-label="快捷分类">
              <button
                type="button"
                className="hero-quick-btn q-primary"
                onClick={() => {
                  setCategory("休闲");
                  scrollToGrid();
                }}
              >
                <Sparkles className="icon" />
                休闲类
              </button>
              <button
                type="button"
                className="hero-quick-btn q-secondary"
                onClick={() => {
                  setCategory("益智");
                  scrollToGrid();
                }}
              >
                <Trophy className="icon" />
                益智类
              </button>
              <button
                type="button"
                className="hero-quick-btn q-success"
                onClick={() => {
                  setCategory("动作");
                  scrollToGrid();
                }}
              >
                <Zap className="icon" />
                动作类
              </button>
              <button
                type="button"
                className="hero-quick-btn q-amber"
                onClick={() => {
                  setCategory("棋牌");
                  scrollToGrid();
                }}
              >
                <Trophy className="icon" />
                棋牌类
              </button>
              <button
                type="button"
                className="hero-quick-btn"
                style={{
                  gridColumn: "span 2",
                  background:
                    "linear-gradient(135deg, var(--primary-soft), var(--secondary-soft))",
                  color: "var(--primary-600)",
                }}
                onClick={() => {
                  setCategory("all");
                  scrollToGrid();
                }}
              >
                <Gamepad2 className="icon" />
                浏览全部游戏
              </button>
            </div>
          </div>

          {/* 右列：轮播 Banner */}
          <div
            className="hero-banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className={`hero-media hero-grad-bg ${game.gradient}`}>
              <div className="hero-media-emoji">
                <span>{game.emoji}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
            </div>
            <div className="hero-shade" />

            {/* 桌面玻璃卡 */}
            <div className="hero-banner-glass">
              <div className="hero-banner-meta">
                <span className="hero-banner-avatar" aria-hidden="true">
                  LJ
                </span>
                <span className="hero-banner-author">灵境推荐 · 每日精选</span>
                <span className="chip-mini muted">· 刚刚更新</span>
              </div>
              <h1
                onClick={() => game.href !== "#" && openGame(game.id)}
                style={{ cursor: game.href !== "#" ? "pointer" : "default" }}
              >
                {game.title}
              </h1>
              <p className="hero-banner-description">{game.description}</p>
              <div className="hero-banner-tags">
                <span className="chip-mini primary">{game.category}</span>
                <span className="chip-mini muted">{game.tag}</span>
                <span className="chip-mini muted">{game.duration}</span>
                <span className="chip-mini muted">游玩 {game.plays}</span>
                <span className="chip-mini muted">评分 {game.rating}</span>
                {game.href !== "#" && (
                  <button
                    className="button button-primary"
                    type="button"
                    style={{ marginLeft: "auto", minHeight: 32, padding: "0 14px" }}
                    onClick={() => openGame(game.id)}
                  >
                    <Play className="icon" aria-hidden="true" />
                    开始游戏
                  </button>
                )}
              </div>
            </div>

            {/* 移动端备用卡 */}
            <div className="hero-mobile-card">
              <div className="hero-mobile-gradient" />
              <div className="hero-mobile-inner">
                <div className="hero-tags">
                  <span className="tag">{game.category}</span>
                  <span className="tag">{game.tag}</span>
                </div>
                <h1>{game.title}</h1>
                <p>{game.description}</p>
                <div className="hero-stats">
                  <span>
                    <strong>{game.plays}</strong>次游玩
                  </span>
                  <span>
                    <strong>{game.rating}</strong>评分
                  </span>
                </div>
                <div className="hero-cta" style={{ marginTop: 8 }}>
                  {game.href !== "#" ? (
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => openGame(game.id)}
                    >
                      <Play className="icon" aria-hidden="true" />
                      开始游戏
                    </button>
                  ) : (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={scrollToGrid}
                    >
                      浏览全部
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 左右箭头 */}
            <div className="hero-controls">
              <button
                className="hero-arrow"
                type="button"
                aria-label="上一个精选"
                onClick={() => moveHero(-1)}
              >
                <ChevronLeft className="icon" />
              </button>
              <button
                className="hero-arrow"
                type="button"
                aria-label="下一个精选"
                onClick={() => moveHero(1)}
              >
                <ChevronRight className="icon" />
              </button>
            </div>

            {/* 分页点 */}
            <div className="hero-dots" aria-label="精选分页">
              {featured.map((item, index) => (
                <button
                  key={item.id}
                  className={`hero-dot${index === heroIndex ? " is-active" : ""}`}
                  type="button"
                  aria-label={`切换到第 ${index + 1} 个精选`}
                  onClick={() => setHeroIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== QuickStrip（仅手机显示） ====================

function QuickStrip() {
  return (
    <section className="quick-strip" aria-label="快捷入口">
      <a className="quick-item" href="#gameSection">
        <span className="quick-icon">
          <LayoutGrid className="icon" />
        </span>
        <span>
          <strong>{GAMES.length}</strong>
          <small>全部游戏</small>
        </span>
      </a>
      <a className="quick-item" href="#gameSection">
        <span className="quick-icon">
          <Sparkles className="icon" />
        </span>
        <span>
          <strong>{GAMES.filter((g) => g.status === "可玩").length}</strong>
          <small>当前可玩</small>
        </span>
      </a>
      <a className="quick-item" href="#rankPanel">
        <span className="quick-icon">
          <Trophy className="icon" />
        </span>
        <span>
          <strong>Top 5</strong>
          <small>人气排行</small>
        </span>
      </a>
      <a className="quick-item" href="#gameSection">
        <span className="quick-icon">
          <Clock className="icon" />
        </span>
        <span>
          <strong>10 分钟</strong>
          <small>轻松一局</small>
        </span>
      </a>
    </section>
  );
}

// ==================== Sidebar ====================

interface SidebarProps {
  category: string;
  setCategory: (c: string) => void;
  openGame: (id: string) => void;
}

function Sidebar({ category, setCategory, openGame }: SidebarProps) {
  const ranked = useMemo(
    () => [...GAMES].sort((a, b) => b.playValue - a.playValue).slice(0, 5),
    []
  );

  return (
    <aside className="sidebar">
      {/* 人气排行 */}
      <section className="panel rank-panel" id="rankPanel" aria-labelledby="rankTitle">
        <div className="panel-heading">
          <h2 id="rankTitle">人气排行</h2>
          <span className="panel-note">本周</span>
        </div>
        <ol className="rank-list">
          {ranked.map((game, index) => (
            <li
              key={game.id}
              className="rank-item"
              onClick={() => openGame(game.id)}
              tabIndex={0}
              role="button"
              aria-label={`查看排行第 ${index + 1} 名 ${game.title}`}
            >
              <span className="rank-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={`rank-cover rank-cover-grad ${game.gradient}`}>
                <span className="rank-cover-emoji">{game.emoji}</span>
              </span>
              <span className="rank-copy">
                <span className="rank-name">{game.title}</span>
                <span className="rank-meta">
                  {game.category} · {game.plays}次游玩
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 游戏类型 */}
      <section className="panel category-panel" aria-labelledby="categoryTitle">
        <div className="panel-heading">
          <h2 id="categoryTitle">游戏类型</h2>
        </div>
        <div className="category-chip-list">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip${category === item ? " is-active" : ""}`}
              onClick={() => setCategory(item)}
            >
              {CATEGORY_LABELS[item]}
            </button>
          ))}
        </div>
      </section>

      {/* 灵境快讯 */}
      <section className="panel note-panel">
        <div className="panel-heading">
          <h2>灵境快讯</h2>
        </div>
        <ul className="note-list">
          <li>
            <span className="note-dot" />
            <span>灵境农场已支持云端存档，放心关机不怕丢进度</span>
          </li>
          <li>
            <span className="note-dot" />
            <span>摸鱼房间上线，快来创建你的专属摸鱼空间</span>
          </li>
          <li>
            <span className="note-dot" />
            <span>排行榜每周一 00:00 重置，快来争夺第一吧</span>
          </li>
        </ul>
      </section>
    </aside>
  );
}

// ==================== GameGrid ====================

interface GameGridProps {
  category: string;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  listView: boolean;
  toggleListView: () => void;
  openGame: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

function GameGrid({
  category,
  sort,
  setSort,
  listView,
  toggleListView,
  openGame,
  favorites,
  toggleFavorite,
}: GameGridProps) {
  const sectionTitle = CATEGORY_LABELS[category] ?? "热门游戏";

  const filtered = useMemo(() => {
    return GAMES.filter((g) => category === "all" || g.category === category).sort(
      (a, b) => {
        if (sort === "rating") {
          const ra = parseFloat(a.rating) || 0;
          const rb = parseFloat(b.rating) || 0;
          return rb - ra;
        }
        if (sort === "newest") {
          return Number(a.status === "开发中") - Number(b.status === "开发中");
        }
        return b.playValue - a.playValue;
      }
    );
  }, [category, sort]);

  return (
    <section className="game-section" id="gameSection" aria-labelledby="gameSectionTitle">
      <div className="section-toolbar">
        <div className="section-left">
          <p className="section-eyebrow">
            <LayoutGrid className="icon" aria-hidden="true" />
            游戏大厅
          </p>
          <h2 id="gameSectionTitle">{sectionTitle}</h2>
          <p className="result-count">
            {filtered.length === 0
              ? "没有匹配结果"
              : `共 ${filtered.length} 款游戏`}
          </p>
        </div>
        <div className="toolbar-actions">
          <label className="sort-control" htmlFor="sortSelect">
            <span>排序</span>
            <select
              id="sortSelect"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button view-toggle"
            type="button"
            aria-label="切换列表布局"
            aria-pressed={listView}
            onClick={toggleListView}
          >
            <LayoutGrid className="icon" />
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={`game-grid${listView ? " is-list" : ""}`}>
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onOpen={openGame}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <Search className="icon" />
          </span>
          <h3>没有找到匹配的游戏</h3>
          <p>换个分类试试。</p>
        </div>
      )}
    </section>
  );
}

// ==================== GameCard ====================

interface GameCardProps {
  game: GameItem;
  isFavorite: boolean;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function GameCard({ game, isFavorite, onOpen, onToggleFavorite }: GameCardProps) {
  const disabled = game.status === "开发中";
  const badgeCat = getCategoryBadge(game.category);
  const badgeTag = getTagBadge(game.tag);

  return (
    <article
      className={`game-card${disabled ? " is-disabled" : ""}`}
      onClick={() => {
        if (!disabled) onOpen(game.id);
      }}
    >
      {/* 封面 */}
      <div className={`game-card-media game-card-cover ${game.gradient}`}>
        <span className="game-card-emoji">{game.emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
        {disabled && (
          <span className="game-dev-overlay">
            <span className="game-dev-chip">开发中</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="game-card-body">
        <div className="game-card-top">
          <h3 className="game-title">{game.title}</h3>
          <button
            type="button"
            className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
            aria-label={isFavorite ? "取消收藏" : "收藏游戏"}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
          >
            <Heart className="icon" />
          </button>
        </div>

        <p className="game-desc">{game.description}</p>

        <div className="game-card-tags">
          <span className={`badge ${badgeCat}`}>{game.category}</span>
          <span className={`badge ${badgeTag}`}>{game.tag}</span>
        </div>

        <div className="card-meta-line">
          <span className="meta-group">
            <Users className="icon" aria-hidden="true" />
            {game.plays}
          </span>
          <span className="meta-divider" aria-hidden="true" />
          <span className="meta-group meta-rating">
            <Star className="icon" aria-hidden="true" />
            <strong>{game.rating}</strong>
          </span>
          <span className="meta-divider" aria-hidden="true" />
          <span className="meta-group">{game.duration}</span>
        </div>
      </div>
    </article>
  );
}

// ==================== 内联样式（对齐 mini-playbox styles.css） ====================

const styles = `
/* =========================================================
   灵境首页 —— 对齐 Mini Playbox / TouchGal HeroUI 设计语言
   ========================================================= */
.lingjing-root {
  --background: #ffffff;
  --foreground: hsl(201.82 24.44% 8.82%);
  --foreground-50:  hsl(0 0% 98.04%);
  --foreground-100: hsl(240 4.76% 95.88%);
  --foreground-200: hsl(240 5.88% 90%);
  --foreground-300: hsl(240 4.88% 83.92%);
  --foreground-400: hsl(240 5.03% 64.9%);
  --foreground-500: hsl(240 3.83% 46.08%);
  --foreground-600: hsl(240 5.2% 33.92%);
  --foreground-700: hsl(240 5.26% 26.08%);
  --foreground-800: hsl(240 3.7% 15.88%);
  --foreground-900: hsl(240 5.88% 10%);
  --content1: #ffffff;
  --content2: hsl(240 4.76% 95.88%);
  --content3: hsl(240 5.88% 90%);
  --primary-50:  hsl(212.5 92.31% 94.9%);
  --primary-100: hsl(211.84 92.45% 89.61%);
  --primary-200: hsl(211.84 92.45% 79.22%);
  --primary-500: hsl(212.02 100% 46.67%);
  --primary-600: hsl(212.14 100% 38.43%);
  --primary-foreground: #ffffff;
  --secondary-50:  hsl(270 61.54% 94.9%);
  --secondary-100: hsl(270 59.26% 89.41%);
  --secondary-200: hsl(270 59.26% 78.82%);
  --secondary-500: hsl(270 66.67% 47.06%);
  --secondary-600: hsl(270 66.67% 37.65%);
  --success-50:  hsl(146.67 64.29% 94.51%);
  --success-100: hsl(145.71 61.4% 88.82%);
  --success-200: hsl(146.2 61.74% 77.45%);
  --success-500: hsl(145.96 79.46% 43.92%);
  --success-700: hsl(145.79 79.26% 26.47%);
  --warning-400: hsl(37.03 91.27% 55.1%);
  --sky-100: hsl(223.64 92.31% 94.9%);
  --sky-700: hsl(202.55 100% 32.16%);
  --violet-100: hsl(270 61.54% 94.9%);
  --violet-700: hsl(270 66.67% 28.24%);
  --emerald-100: hsl(146.67 64.29% 94.51%);
  --emerald-700: hsl(145.79 79.26% 26.47%);
  --amber-100: hsl(48 96.43% 93.73%);
  --amber-700: hsl(37.01 91.27% 44.12%);
  --rose-100: hsl(340 91.84% 90.39%);
  --rose-700: hsl(339 86.54% 40.78%);
  --divider: hsl(0 0% 6.67% / 0.15);
  --bg: var(--background);
  --surface: var(--content1);
  --surface-2: var(--content2);
  --text: var(--foreground);
  --muted: var(--foreground-500);
  --border: var(--foreground-200);
  --primary: var(--primary-500);
  --primary-hover: var(--primary-600);
  --primary-soft: hsl(212.02 100% 46.67% / 0.20);
  --secondary-soft: hsl(270 66.67% 47.06% / 0.20);
  --success-soft: hsl(145.96 79.46% 43.92% / 0.20);
  --amber-soft: hsl(37.03 91.27% 55.1% / 0.20);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-card: 22px;
  --radius-full: 9999px;
  --shadow-sm: 0 0 5px rgba(0,0,0,0.02), 0 2px 10px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.30);
  --shadow-md: 0 0 15px rgba(0,0,0,0.03), 0 2px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.30);
  --shadow-lg: 0 0 30px rgba(0,0,0,0.04), 0 30px 60px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.30);
  --shadow-card: 0 12px 32px rgba(15, 23, 42, 0.05), 0 0 1px rgba(0,0,0,0.25);
  --shadow-card-hover: 0 16px 42px rgba(15, 23, 42, 0.08), 0 0 1px rgba(0,0,0,0.30);
  --shadow-chip-md: 0 4px 10px rgba(15, 23, 42, 0.06), 0 0 1px rgba(0,0,0,0.25);
  --header-bg: rgba(255, 255, 255, 0.70);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --dur: 0.18s;
  --hover-opacity: 0.85;
}
html.dark .lingjing-root {
  --background: #0a0c10;
  --foreground: #f5f2ea;
  --foreground-50:  hsl(240 5.88% 10%);
  --foreground-100: hsl(240 3.7% 15.88%);
  --foreground-200: hsl(240 5.26% 26.08%);
  --foreground-300: hsl(240 5.2% 33.92%);
  --foreground-400: hsl(240 5.03% 50%);
  --foreground-500: hsl(240 4.88% 70%);
  --foreground-600: hsl(240 5.88% 84%);
  --foreground-700: hsl(240 4.76% 90%);
  --foreground-800: hsl(0 0% 95.88%);
  --foreground-900: hsl(0 0% 98.04%);
  --content1: hsl(240 3.7% 15.88%);
  --content2: hsl(240 5.26% 22%);
  --content3: hsl(240 5.26% 26.08%);
  --primary-500: hsl(212.02 100% 60%);
  --primary-600: hsl(212.02 100% 70%);
  --primary-soft: hsl(212.02 100% 60% / 0.18);
  --secondary-500: hsl(270 66.67% 60%);
  --secondary-600: hsl(270 66.67% 72%);
  --secondary-soft: hsl(270 66.67% 60% / 0.18);
  --success-500: hsl(145.96 79.46% 55%);
  --success-700: hsl(145.96 79.46% 75%);
  --success-soft: hsl(145.96 79.46% 55% / 0.18);
  --warning-400: hsl(37.03 91.27% 70%);
  --sky-100: hsl(202.55 100% 25%);
  --sky-700: hsl(202.55 100% 85%);
  --violet-100: hsl(270 60% 25%);
  --violet-700: hsl(270 60% 88%);
  --emerald-100: hsl(145.96 50% 22%);
  --emerald-700: hsl(145.96 60% 85%);
  --amber-100: hsl(37 50% 24%);
  --amber-700: hsl(37 90% 82%);
  --rose-100: hsl(339 50% 24%);
  --rose-700: hsl(339 70% 85%);
  --divider: hsl(0 0% 96% / 0.12);
  --primary: var(--primary-500);
  --primary-hover: var(--primary-600);
  --shadow-card: 0 12px 32px rgba(0, 0, 0, 0.32), 0 0 1px rgba(255,255,255,0.10);
  --shadow-card-hover: 0 18px 48px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255,255,255,0.15);
  --shadow-chip-md: 0 6px 16px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255,255,255,0.10);
  --shadow-md: 0 0 15px rgba(0,0,0,0.4), 0 2px 30px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.10);
}

.lingjing-root #main-content {
  color: var(--text);
  padding-top: 5rem;
  padding-bottom: 4rem;
  min-height: 100vh;
}

/* icon sizing */
.lingjing-root .icon {
  width: 1em; height: 1em;
  fill: none; stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
  vertical-align: -0.12em;
  flex-shrink: 0;
  font-size: inherit;
}
.lingjing-root .absolute { position: absolute; }
.lingjing-root .inset-0 { inset: 0; }
.lingjing-root .flex { display: flex; }
.lingjing-root .items-center { align-items: center; }
.lingjing-root .justify-center { justify-content: center; }
.lingjing-root .pointer-events-none { pointer-events: none; }
.lingjing-root .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
.lingjing-root .from-white\\/10 { --tw-gradient-from: rgb(255 255 255 / 0.1); }
.lingjing-root .via-transparent { --tw-gradient-to: transparent; }
.lingjing-root .to-black\\/20 { --tw-gradient-to: rgb(0 0 0 / 0.2); }
.lingjing-root .to-black\\/30 { --tw-gradient-to: rgb(0 0 0 / 0.3); }

/* ==== buttons ==== */
.lingjing-root .button {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  min-height: 40px; padding: 0 16px;
  border: 0; border-radius: var(--radius-md);
  cursor: pointer; font-weight: 500; white-space: nowrap;
  font-size: 0.875rem;
  transition: transform 0.12s var(--ease-out),
              background-color 0.18s var(--ease-out),
              opacity 0.18s var(--ease-out);
  user-select: none;
}
.lingjing-root .button:active { transform: scale(0.97); }
.lingjing-root .button:hover  { opacity: var(--hover-opacity); }
.lingjing-root .button-primary {
  background: var(--primary); color: #fff;
}
.lingjing-root .button-primary:hover { background: var(--primary-hover); opacity: 1; }
.lingjing-root .button-secondary {
  background: var(--surface-2); color: var(--text);
  border: 1px solid var(--divider);
}

/* icon-button (for toolbar) */
.lingjing-root .icon-button {
  position: relative;
  display: inline-grid; place-items: center;
  width: 40px; height: 40px;
  flex-shrink: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--foreground-500);
  cursor: pointer;
  transition: background 0.18s var(--ease-out), color 0.18s;
}
.lingjing-root .icon-button:hover {
  color: var(--text);
  background: var(--content2);
}
.lingjing-root .icon-button[aria-pressed="true"] {
  color: var(--primary-600);
  background: var(--primary-soft);
}
.lingjing-root .icon-button .icon { font-size: 22px; }

/* sort control */
.lingjing-root .sort-control {
  display: inline-flex; align-items: center; gap: 10px;
  height: 40px; padding: 0 12px;
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  background: var(--content1);
  color: var(--muted); font-size: 13px; font-weight: 500;
  box-shadow: var(--shadow-sm);
}
.lingjing-root .sort-control select {
  border: 0; outline: 0;
  background: transparent; color: var(--text);
  font-weight: 700; cursor: pointer;
}

/* ==== HERO ==== */
.lingjing-root .hero { position: relative; width: 100%; overflow: hidden; }
.lingjing-root .hero-wrap {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 16px 24px 0;
}
.lingjing-root .hero-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
  min-height: 300px;
}
@media (max-width: 819px) {
  .lingjing-root .hero-top { grid-template-columns: 1fr; min-height: auto; gap: 16px; }
}
.lingjing-root .hero-left {
  display: flex; flex-direction: column; gap: 12px; min-height: 300px;
}
.lingjing-root .hero-welcome {
  position: relative; display: flex; flex-direction: column;
  justify-content: space-between; flex: 1 1 auto; min-height: 0;
  padding: 12px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg,
      hsl(212.02 100% 46.67% / 0.10) 0%,
      hsl(270    66.67% 47.06% / 0.10) 50%,
      hsl(145.96 79.46% 43.92% / 0.10) 100%);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.lingjing-root .hero-welcome-inner { position: relative; display: flex; flex-direction: column; gap: 10px; }
.lingjing-root .hero-welcome-top { display: flex; align-items: center; gap: 8px; }
.lingjing-root .hero-kicker-wrap { display: inline-flex; align-items: center; gap: 8px; }
.lingjing-root .hero-kicker {
  position: relative; display: inline-flex; align-items: center;
  min-width: 0; padding: 0 8px; height: 28px;
  border-radius: var(--radius-full);
  background: var(--primary-soft); color: var(--primary-600);
  font-size: 14px; font-weight: 500;
}
.lingjing-root .hero-kicker .icon { color: var(--primary-500); font-size: 20px; }
.lingjing-root .hero-title-block { display: flex; flex-direction: column; gap: 10px; }
.lingjing-root .hero h1 {
  margin: 0; font-size: 26px; font-weight: 800; line-height: 1.15;
  background: linear-gradient(90deg, var(--primary-500) 0%, var(--secondary-500) 100%);
  background-clip: text; -webkit-background-clip: text;
  color: transparent; letter-spacing: -0.01em;
}
@media (min-width: 1280px) {
  .lingjing-root .hero h1 { font-size: 32px; }
}
.lingjing-root .hero-subtitle {
  margin: 0; font-size: 13px; color: var(--foreground-600); line-height: 1.5;
}
.lingjing-root .hero-cta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lingjing-root .icon-btn-social {
  width: 36px; height: 36px; min-width: 36px;
  border: 0; border-radius: var(--radius-md);
  display: inline-grid; place-items: center;
  background: var(--secondary-soft); color: var(--secondary-600);
  cursor: pointer;
  transition: opacity 0.18s, transform 0.12s var(--ease-out);
  text-decoration: none;
}
.lingjing-root .icon-btn-social:hover { opacity: var(--hover-opacity); }
.lingjing-root .icon-btn-social:active { transform: scale(0.95); }

.lingjing-root .hero-quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px; flex-shrink: 0;
}
@media (min-width: 640px) { .lingjing-root .hero-quick-grid { gap: 16px; } }
.lingjing-root .hero-quick-btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  gap: 10px; padding: 0 16px; min-height: 44px; min-width: 0; width: 100%;
  border: 0; border-radius: var(--radius-md);
  box-shadow: var(--shadow-chip-md); opacity: 0.72;
  font-size: 15px; font-weight: 500; cursor: pointer;
  transition: transform 0.12s var(--ease-out), opacity 0.18s;
}
.lingjing-root .hero-quick-btn:active { transform: scale(0.97); }
.lingjing-root .hero-quick-btn:hover { opacity: 1; }
.lingjing-root .hero-quick-btn .icon { font-size: 18px; }
.lingjing-root .hero-quick-btn.q-primary   { background: var(--primary-soft);   color: var(--primary-600); }
.lingjing-root .hero-quick-btn.q-secondary { background: var(--secondary-soft); color: var(--secondary-600); }
.lingjing-root .hero-quick-btn.q-success   { background: var(--success-soft);   color: var(--success-700); }
.lingjing-root .hero-quick-btn.q-amber     { background: var(--amber-soft);     color: #b2710d; }
html.dark .lingjing-root .hero-quick-btn.q-amber { color: var(--amber-700); }

/* banner */
.lingjing-root .hero-banner {
  position: relative; min-height: 300px; overflow: hidden;
  border-radius: var(--radius-xl); touch-action: pan-y;
}
@media (max-width: 819px) { .lingjing-root .hero-banner { min-height: 240px; } }
.lingjing-root .hero-media {
  position: absolute; inset: 0; z-index: 1;
}
.lingjing-root .hero-grad-bg {
  background-size: cover !important;
}
.lingjing-root .hero-media-emoji {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.lingjing-root .hero-media-emoji span {
  font-size: 180px;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
  opacity: 0.85;
  transform: scale(0.92);
}
.lingjing-root .hero-shade {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(to top, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 45%, transparent 100%);
}
.lingjing-root .hero-banner-glass {
  position: absolute;
  bottom: 16px; left: 16px; right: 16px; z-index: 4;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--content1) 80%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  box-shadow: var(--shadow-md);
  animation: lj-glass-slide-up 0.4s ease 0.1s both;
}
@keyframes lj-glass-slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lingjing-root .hero-banner-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.lingjing-root .hero-banner-avatar {
  width: 24px; height: 24px; border-radius: 9999px;
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  color: #fff; font-size: 10px; font-weight: 800;
  display: grid; place-items: center;
}
.lingjing-root .hero-banner-author { font-size: 13px; color: color-mix(in srgb, var(--text) 80%, transparent); }
.lingjing-root .hero-banner h1 {
  margin: 0 0 8px; font-size: 24px; font-weight: 800; line-height: 1.2;
  color: var(--text); background: none; -webkit-text-fill-color: initial;
  letter-spacing: 0;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
  transition: color 0.18s; cursor: pointer;
}
.lingjing-root .hero-banner h1:hover { color: var(--primary-500); }
.lingjing-root .hero-banner-description {
  margin: 0 0 12px; font-size: 13px;
  color: color-mix(in srgb, var(--text) 80%, transparent);
  line-height: 1.5;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
}
.lingjing-root .hero-banner-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lingjing-root .chip-mini {
  position: relative; display: inline-flex; align-items: center;
  padding: 0 4px; height: 24px;
  border-radius: var(--radius-full);
  font-size: 12px; font-weight: 500; white-space: nowrap;
}
.lingjing-root .chip-mini.primary { background: var(--primary-soft);   color: var(--primary-600); }
.lingjing-root .chip-mini.muted   { background: color-mix(in srgb, var(--content2) 100%, transparent); color: var(--foreground-700); }
html.dark .lingjing-root .chip-mini.muted { color: var(--foreground-300); }

.lingjing-root .hero-controls {
  position: absolute; z-index: 10;
  top: 50%; left: 8px; right: 8px;
  display: flex; justify-content: space-between; align-items: center;
  pointer-events: none; opacity: 0; transform: translateY(-50%);
  transition: opacity 0.22s;
}
@media (hover: hover) {
  .lingjing-root .hero-banner:hover .hero-controls { opacity: 1; }
}
.lingjing-root .hero-arrow {
  display: inline-grid; place-items: center;
  width: auto; height: auto; padding: 6px; border: 0;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--background) 20%, transparent);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  color: #fff; cursor: pointer; pointer-events: auto;
  transition: background 0.18s;
}
.lingjing-root .hero-arrow:hover { background: color-mix(in srgb, var(--background) 40%, transparent); }
.lingjing-root .hero-arrow .icon { font-size: 16px; }

.lingjing-root .hero-dots {
  position: absolute; z-index: 10;
  left: 50%; bottom: 12px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
}
.lingjing-root .hero-dot {
  width: 6px; height: 6px; padding: 0; border: 0;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.28); cursor: pointer;
  transition: background 0.18s, width 0.18s;
}
.lingjing-root .hero-dot:hover { background: rgba(255,255,255,0.5); }
.lingjing-root .hero-dot.is-active {
  background: var(--primary-500);
  width: 16px;
}

/* 移动端 hero 备用卡 */
.lingjing-root .hero-mobile-card {
  position: absolute; inset: 0; z-index: 3;
  display: none; flex-direction: column;
}
@media (max-width: 639px) {
  .lingjing-root .hero-mobile-card { display: flex; }
  .lingjing-root .hero-banner-glass { display: none; }
}
.lingjing-root .hero-mobile-gradient {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 55%, transparent 100%);
  border-radius: var(--radius-xl);
}
.lingjing-root .hero-mobile-inner {
  position: relative; z-index: 2;
  margin-top: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 8px; color: #fff;
}
.lingjing-root .hero-mobile-inner h1 {
  margin: 0; font-size: 18px; font-weight: 800; line-height: 1.2;
  color: #fff; background: none; -webkit-text-fill-color: #fff;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
}
.lingjing-root .hero-mobile-inner p {
  margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.86);
  line-height: 1.4;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.lingjing-root .hero-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lingjing-root .tag {
  padding: 3px 8px; border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.16); color: #fff;
  font-size: 11px; font-weight: 700;
}
.lingjing-root .hero-stats {
  display: flex; flex-wrap: wrap; gap: 14px;
  margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.78);
}
.lingjing-root .hero-stats strong { margin-right: 3px; color: #fff; font-size: 13px; }

/* Quick Strip (手机版) */
.lingjing-root .quick-strip { display: none; }
@media (max-width: 639px) {
  .lingjing-root .quick-strip {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(1280px, 100%);
    margin: 12px auto 0;
    padding: 0 24px;
    gap: 12px;
  }
}
.lingjing-root .quick-item {
  position: relative; display: flex; align-items: center; gap: 12px;
  min-width: 0; padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: var(--content1);
  border: 1px solid var(--divider);
  box-shadow: var(--shadow-sm);
  color: var(--text); text-decoration: none;
  cursor: pointer;
  transition: box-shadow 0.22s, transform 0.12s;
  text-align: left;
}
.lingjing-root .quick-item:active { transform: scale(0.98); }
.lingjing-root .quick-item:hover { box-shadow: var(--shadow-md); }
.lingjing-root .quick-icon {
  display: inline-grid; place-items: center;
  width: 36px; height: 36px; flex-shrink: 0;
  border-radius: var(--radius-md);
  font-size: 18px;
}
.lingjing-root .quick-item:nth-child(1) .quick-icon { background: var(--primary-soft);   color: var(--primary-600); }
.lingjing-root .quick-item:nth-child(2) .quick-icon { background: var(--secondary-soft); color: var(--secondary-600); }
.lingjing-root .quick-item:nth-child(3) .quick-icon { background: var(--amber-soft);     color: var(--foreground-700); }
html.dark .lingjing-root .quick-item:nth-child(3) .quick-icon { color: var(--amber-700); }
.lingjing-root .quick-item:nth-child(4) .quick-icon { background: var(--success-soft);   color: var(--success-700); }
.lingjing-root .quick-item > span:last-child { display: flex; flex-direction: column; min-width: 0; }
.lingjing-root .quick-item strong { font-size: 14px; white-space: nowrap; font-weight: 700; }
.lingjing-root .quick-item small  { margin-top: 2px; color: var(--muted); font-size: 11px; }

/* content-shell (sidebar + grid) */
.lingjing-root .content-shell {
  width: min(1280px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
}
@media (max-width: 959px) {
  .lingjing-root .content-shell { grid-template-columns: 1fr; }
}
@media (max-width: 819px) {
  .lingjing-root .content-shell { padding: 20px 16px; }
}
.lingjing-root .sidebar {
  display: flex; flex-direction: column; gap: 16px; min-width: 0;
}
@media (max-width: 959px) {
  .lingjing-root .sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    order: 2;
  }
  .lingjing-root .note-panel { grid-column: 1 / -1; }
  .lingjing-root .game-section { order: 1; }
}
@media (max-width: 639px) {
  .lingjing-root .content-shell { padding: 16px 12px; }
  .lingjing-root .sidebar { grid-template-columns: 1fr; }
  .lingjing-root .note-panel { grid-column: auto; }
}
.lingjing-root .panel {
  border: 1px solid var(--divider);
  border-radius: var(--radius-lg);
  background: var(--content1);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}
.lingjing-root .panel-heading {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 14px;
}
.lingjing-root .panel-heading h2,
.lingjing-root .section-toolbar h2 {
  margin: 0; font-size: 18px; font-weight: 800;
  line-height: 1.2; letter-spacing: -0.005em;
}
@media (min-width: 640px) {
  .lingjing-root .panel-heading h2,
  .lingjing-root .section-toolbar h2 { font-size: 24px; }
}
.lingjing-root .panel-note { color: var(--muted); font-size: 12px; font-weight: 500; }

/* rank list */
.lingjing-root .rank-list {
  display: flex; flex-direction: column; gap: 12px;
  margin: 0; padding: 0; list-style: none;
}
.lingjing-root .rank-item {
  display: grid;
  grid-template-columns: 24px 44px minmax(0, 1fr);
  align-items: center; gap: 10px;
  cursor: pointer; padding: 4px 2px;
  border-radius: 10px;
  transition: background 0.18s;
}
.lingjing-root .rank-item:hover { background: var(--content2); }
.lingjing-root .rank-index {
  color: var(--muted); font-size: 12px; font-weight: 800; text-align: center;
}
.lingjing-root .rank-item:nth-child(-n+3) .rank-index { color: var(--primary-600); }
.lingjing-root .rank-cover {
  position: relative;
  width: 44px; height: 32px;
  overflow: hidden; border-radius: 8px;
  background: var(--content2);
}
.lingjing-root .rank-cover-grad {
  background-size: cover !important;
}
.lingjing-root .rank-cover-emoji {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.lingjing-root .rank-copy { min-width: 0; }
.lingjing-root .rank-name {
  overflow: hidden;
  color: var(--text); font-size: 13px; font-weight: 700;
  text-overflow: ellipsis; white-space: nowrap;
}
.lingjing-root .rank-meta { margin-top: 3px; color: var(--muted); font-size: 11px; }

/* category chips */
.lingjing-root .category-chip-list {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.lingjing-root .chip {
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  padding: 7px 12px;
  background: var(--content1);
  color: var(--foreground-500);
  font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: all 0.18s var(--ease-out);
}
.lingjing-root .chip:hover { color: var(--primary-600); border-color: var(--primary-500); background: var(--primary-soft); }
.lingjing-root .chip.is-active {
  color: #fff;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
  border-color: transparent;
  box-shadow: 0 6px 14px hsl(212 100% 46.67% / 0.24);
}

/* note list */
.lingjing-root .note-list { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }
.lingjing-root .note-list li {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 6px 0;
  color: var(--foreground-600); font-size: 13px; line-height: 1.45;
}
html.dark .lingjing-root .note-list li { color: var(--foreground-500); }
.lingjing-root .note-dot {
  width: 8px; height: 8px; flex-shrink: 0; margin-top: 7px;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  box-shadow: 0 0 0 3px var(--primary-soft);
}

/* section toolbar */
.lingjing-root .game-section { min-width: 0; }
.lingjing-root .section-toolbar {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; margin-bottom: 20px;
}
.lingjing-root .section-left { display: flex; flex-direction: column; gap: 0; }
.lingjing-root .section-eyebrow {
  margin: 0 0 6px;
  color: var(--primary-600);
  font-size: 12px; font-weight: 800;
  letter-spacing: 0.02em;
  display: inline-flex; align-items: center; gap: 6px;
}
.lingjing-root .section-eyebrow::before {
  content: ""; width: 3px; height: 12px; border-radius: 2px;
  background: linear-gradient(180deg, var(--primary-500), var(--secondary-500));
}
.lingjing-root .result-count { margin: 6px 0 0; color: var(--muted); font-size: 13px; font-weight: 500; }
.lingjing-root .btn-more {
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 40px; padding: 0 16px;
  border-radius: var(--radius-md);
  background: transparent; color: var(--primary-600);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background 0.18s; border: 0;
}
.lingjing-root .btn-more:hover { background: var(--primary-soft); }
.lingjing-root .toolbar-actions { display: flex; align-items: center; gap: 10px; }

/* game grid — 4列对齐 mini-playbox */
.lingjing-root .game-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
@media (max-width: 1199px) {
  .lingjing-root .game-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
}
@media (max-width: 899px) {
  .lingjing-root .game-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
}

.lingjing-root .game-grid.is-list { grid-template-columns: 1fr; }
.lingjing-root .game-grid.is-list .game-card { flex-direction: row; }
.lingjing-root .game-grid.is-list .game-card-media {
  width: 220px; flex: 0 0 220px; aspect-ratio: auto;
  border-radius: calc(var(--radius-card) - 4px) 0 0 calc(var(--radius-card) - 4px);
}
.lingjing-root .game-grid.is-list .game-card-body { flex: 1; }

.lingjing-root .game-card {
  position: relative;
  display: flex; min-width: 0; flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--content2) 60%, transparent);
  background: var(--content1); color: var(--text);
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.30s ease, transform 0.30s ease;
  will-change: transform;
}
.lingjing-root .game-card.is-disabled { cursor: not-allowed; opacity: 0.82; }
.lingjing-root .game-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}
.lingjing-root .game-card:active { transform: scale(0.98); }
.lingjing-root .game-card-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0;
}
.lingjing-root .game-card-cover {
  background-size: cover !important;
}
.lingjing-root .game-card-emoji {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 84px;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));
  transition: transform 0.5s ease;
}
.lingjing-root .game-card:hover .game-card-emoji { transform: scale(1.08); }

/* 开发中遮罩 */
.lingjing-root .game-dev-overlay {
  position: absolute; inset: 0; z-index: 4;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.lingjing-root .game-dev-chip {
  background: color-mix(in srgb, var(--content1) 85%, transparent);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  color: var(--warning-400);
  font-weight: 800; font-size: 13px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

.lingjing-root .game-card-body {
  display: flex; flex: 1 1 auto; flex-direction: column;
  gap: 8px; padding: 12px;
}
@media (min-width: 640px) { .lingjing-root .game-card-body { padding: 16px; gap: 12px; } }
.lingjing-root .game-card-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 8px; min-width: 0;
}
.lingjing-root .game-title {
  min-width: 0; margin: 0;
  font-size: 16px; font-weight: 800; line-height: 1.25;
  letter-spacing: 0.005em; color: var(--text);
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  transition: color 0.18s;
}
@media (min-width: 640px) { .lingjing-root .game-title { font-size: 18px; } }
.lingjing-root .game-card:hover .game-title { color: var(--primary-500); }

.lingjing-root .favorite-button {
  display: inline-grid; place-items: center;
  width: 32px; height: 32px; flex-shrink: 0;
  border: 0; border-radius: var(--radius-sm);
  background: transparent; color: var(--foreground-500);
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.lingjing-root .favorite-button:hover { background: var(--primary-soft); color: var(--primary-600); }
.lingjing-root .favorite-button.is-favorite { color: var(--primary-500); }
.lingjing-root .favorite-button.is-favorite .icon { fill: currentColor; stroke: none; }
.lingjing-root .favorite-button .icon { font-size: 18px; }

.lingjing-root .game-desc {
  margin: 0; font-size: 12px; line-height: 1.45; color: var(--foreground-500);
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  min-height: calc(12px * 1.45 * 2);
}
@media (min-width: 640px) {
  .lingjing-root .game-desc { font-size: 13px; min-height: calc(13px * 1.45 * 2); }
}

.lingjing-root .game-card-tags {
  display: flex; min-height: 20px; flex-wrap: wrap;
  gap: 6px; padding-top: 2px;
}
@media (min-width: 640px) {
  .lingjing-root .game-card-tags { min-height: 24px; }
}
.lingjing-root .badge {
  display: inline-flex; align-items: center; justify-content: center;
  height: 20px; min-width: 32px; padding: 0 6px;
  border-radius: var(--radius-sm);
  font-size: 11px; font-weight: 700; line-height: 1; white-space: nowrap;
}
@media (min-width: 640px) {
  .lingjing-root .badge { height: 24px; min-width: 44px; padding: 0 8px; font-size: 12px; }
}
.lingjing-root .badge-sky     { background: var(--sky-100);     color: var(--sky-700); }
.lingjing-root .badge-violet  { background: var(--violet-100);  color: var(--violet-700); }
.lingjing-root .badge-rose    { background: var(--rose-100);    color: var(--rose-700); }
.lingjing-root .badge-emerald { background: var(--emerald-100); color: var(--emerald-700); }
.lingjing-root .badge-amber   { background: var(--amber-100);   color: var(--amber-700); }
.lingjing-root .badge-primary { background: var(--primary-soft); color: var(--primary-600); }

.lingjing-root .card-meta-line {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--muted); margin-top: auto;
}
@media (min-width: 640px) {
  .lingjing-root .card-meta-line { font-size: 14px; gap: 8px; }
}
.lingjing-root .meta-group { display: inline-flex; align-items: center; gap: 6px; }
.lingjing-root .meta-group .icon { font-size: 16px; }
.lingjing-root .meta-group strong { color: var(--text); font-weight: 800; font-size: inherit; }
.lingjing-root .meta-rating .icon { fill: var(--warning-400); stroke: var(--warning-400); }
.lingjing-root .meta-divider {
  width: 1px; height: 16px; background: var(--divider);
}

/* empty state */
.lingjing-root .empty-state {
  display: flex; align-items: center; flex-direction: column;
  padding: 72px 20px;
  border: 1px dashed var(--divider);
  border-radius: var(--radius-card);
  text-align: center;
  background: color-mix(in srgb, var(--content2) 60%, transparent);
}
.lingjing-root .empty-icon {
  display: inline-grid; place-items: center;
  width: 64px; height: 64px; margin-bottom: 16px;
  border-radius: 9999px;
  background: var(--content1);
  color: var(--muted);
  font-size: 28px;
  box-shadow: var(--shadow-sm);
}
.lingjing-root .empty-state h3 { margin: 0; font-size: 18px; font-weight: 800; }
.lingjing-root .empty-state p  { margin: 8px 0 0; color: var(--muted); font-size: 14px; }
`;
