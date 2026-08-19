import { TopBar } from "./TopBar";
import { LeftMenu } from "./LeftMenu";
import { Stage } from "./Stage";
import { BottomBar } from "./BottomBar";
import { HeroDetailDrawer } from "./HeroDetailDrawer";
import { ComingSoonOverlay } from "./ComingSoonOverlay";
import { useBaoweiadouStore } from "../../store";

interface TrainingGroundScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export function TrainingGroundScreen({ onBack, onStart }: TrainingGroundScreenProps) {
  const user = useBaoweiadouStore((s) => s.user);
  const showToast = useBaoweiadouStore((s) => s.showToast);

  const handleStart = () => {
    if (!user) {
      showToast("请先登录后再开始游戏");
      return;
    }
    onStart();
  };

  return (
    <div className="tg-root">
      <TopBar onBack={onBack} />
      <div className="tg-body">
        <LeftMenu onStart={handleStart} />
        <main className="tg-main">
          <Stage />
        </main>
      </div>
      <BottomBar />
      <HeroDetailDrawer />
      <ComingSoonOverlay />
      {/* 隐藏的返回回调，避免 unused 警告 */}
      <button
        className="tg-sr-only"
        onClick={onBack}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
