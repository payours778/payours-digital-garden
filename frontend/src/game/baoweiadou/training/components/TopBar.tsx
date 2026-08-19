import { ArrowLeft, Coins, User } from "lucide-react";
import { useBaoweiadouStore } from "../../store";

/** 顶部状态栏：返回 / 章节 / 账号 / 铜钱占位 */
export function TopBar({ onBack }: { onBack: () => void }) {
  const user = useBaoweiadouStore((s) => s.user);
  const showToast = useBaoweiadouStore((s) => s.showToast);

  return (
    <header className="tg-topbar">
      <button className="tg-topbar__back" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>返回灵境</span>
      </button>

      <div className="tg-topbar__chapter">
        <div className="tg-topbar__chapter-name">长坂坡 · 新野</div>
        <div className="tg-topbar__chapter-sub">公元 208 年 · 当阳道上</div>
      </div>

      <div className="tg-topbar__right">
        <div className="tg-topbar__coins" title="铜钱（即将开放）">
          <Coins size={14} />
          <span>---</span>
        </div>
        <div className="tg-topbar__user">
          <div className="tg-topbar__avatar">
            <User size={16} />
          </div>
          <div className="tg-topbar__name">{user?.displayName ?? "未登录"}</div>
        </div>
        <button
          className="tg-topbar__icon-btn"
          aria-label="提示"
          onClick={() => showToast("军械库与远征模式正在开发中")}
        >
          ?
        </button>
      </div>
    </header>
  );
}
