"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBaoweiadouStore } from "@/game/baoweiadou/store";
import "@/game/baoweiadou/styles.css";

// Phaser 依赖浏览器 API，必须 ssr:false 避免服务端渲染报错
const TowerDefenseGame = dynamic(
  () =>
    import("@/game/baoweiadou").then((m) => m.TowerDefenseGame),
  { ssr: false, loading: () => <LoadingScreen /> },
);

const TrainingGroundScreen = dynamic(
  () =>
    import("@/game/baoweiadou").then((m) => m.TrainingGroundScreen),
  { ssr: false, loading: () => <LoadingScreen /> },
);

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1114]">
      <p className="text-slate-400">加载中...</p>
    </div>
  );
}

export default function BaoweiadouPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<"training" | "battle">("training");

  // 登录后把用户信息注入阿斗内部 store（替代原 useAppStore）
  useEffect(() => {
    const store = useBaoweiadouStore.getState();
    if (user) {
      store.setUser({ displayName: user.username, id: String(user.id) });
    } else {
      store.setUser(null);
    }
  }, [user]);

  // 登录拦截
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="baoweiadou-root min-h-screen flex items-center justify-center bg-[#0f1114] px-4">
        <div className="text-center">
          <p className="text-2xl mb-4">🏯</p>
          <p className="text-slate-300 mb-6">需要登录才能进入保卫阿斗</p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => router.push("/login")}
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  if (view === "battle") {
    return (
      <div className="baoweiadou-root min-h-screen pt-16">
        <TowerDefenseGame
          mode="game"
          onBack={() => router.push("/tree")}
          onExit={() => setView("training")}
        />
      </div>
    );
  }

  return (
    <div className="baoweiadou-root min-h-screen pt-16">
      <TrainingGroundScreen
        onBack={() => router.push("/tree")}
        onStart={() => setView("battle")}
      />
    </div>
  );
}
