import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Config } from "../config";
import { FxTestScene } from "../FxTestScene";
import { GamePlayScene } from "../GamePlayScene";
import { DevConsole } from "./DevConsole";
import { GameStartScreen } from "./GameStartScreen";
import { loadDevConfig } from "../devConfig";
import { AudioToggleButton } from "../audio/AudioToggleButton";
import { playMusic, playSfx, stopMusic, unlock } from "../audio/audioSystem";

export function TowerDefenseGame({
  mode = "game",
  onBack,
  onExit,
}: {
  mode?: "game" | "fx-test";
  onBack: () => void;
  /** 从练兵场进入时，返回练兵场；否则回灵境大厅 */
  onExit?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const fromTraining = !!onExit;

  const handleBack = () => {
    playSfx("click");
    if (fromTraining && onExit) {
      onExit();
      return;
    }
    onBack();
  };

  useEffect(() => {
    loadDevConfig();

    if (mode === "game" && !started) {
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: Config.gameWidth,
      height: Config.gameHeight,
      backgroundColor: "#0f1114",
      scene: mode === "fx-test" ? [FxTestScene] : [GamePlayScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    unlock();
    playMusic(mode === "fx-test" ? "fxTest" : "battle");

    return () => {
      game.destroy(true);
      stopMusic();
    };
  }, [mode, started]);

  if (mode === "game" && !started) {
    return (
      <GameStartScreen
        onStart={() => setStarted(true)}
        onBack={handleBack}
        backLabel={fromTraining ? "返回军营" : "返回灵境"}
      />
    );
  }

  return (
    <div className="tower-defense-page">
      <button
        className="tower-defense-back"
        type="button"
        onClick={handleBack}
      >
        {fromTraining ? "返回军营" : "返回灵境"}
      </button>
      <button
        className="tower-defense-dev"
        type="button"
        onClick={() => {
          playSfx("click");
          setConsoleOpen(true);
        }}
      >
        开发者控制台
      </button>
      <AudioToggleButton />
      <div ref={containerRef} className="tower-defense-container" />
      <div className="crt-overlay" aria-hidden="true" />
      <DevConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  );
}
