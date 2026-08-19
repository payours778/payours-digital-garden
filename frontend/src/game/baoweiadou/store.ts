import { create } from "zustand";

/**
 * 保卫阿斗内部共享 store（替代原项目的 useAppStore）。
 * 用户信息由上层页面（/tree/baoweiadou）从 blog-test 的 useAuth() 注入，
 * 使游戏模块保持自包含、不直接耦合博客的鉴权体系。
 */
export interface GameUser {
  displayName: string;
  id: string;
}

interface BaoweiadouStore {
  user: GameUser | null;
  toast: string | null;
  setUser: (user: GameUser | null) => void;
  showToast: (message: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useBaoweiadouStore = create<BaoweiadouStore>((set) => ({
  user: null,
  toast: null,
  setUser: (user) => set({ user }),
  showToast: (message) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 2200);
  },
}));
