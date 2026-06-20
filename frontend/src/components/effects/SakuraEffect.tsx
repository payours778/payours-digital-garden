"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Sakura {
  id: number;
  left: string;
  width: number;
  height: number;
  animationDuration: number;
  animationDelay: number;
}

export function SakuraEffect() {
  const [sakuras, setSakuras] = useState<Sakura[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setIsMounted(true);
    const generateSakuras = () => {
      const newSakuras: Sakura[] = [];
      for (let i = 0; i < 15; i++) {
        newSakuras.push({
          id: i,
          left: `${Math.random() * 100}%`,
          width: 8 + Math.random() * 12,
          height: 10 + Math.random() * 12,
          animationDuration: 8 + Math.random() * 8,
          animationDelay: Math.random() * 10,
        });
      }
      return newSakuras;
    };

    setSakuras(generateSakuras());
  }, []);

  if (!isMounted) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000"
      style={{ opacity: isDark ? 0 : 1 }}
    >
      {sakuras.map((sakura) => (
        <div
          key={sakura.id}
          className="absolute top-0 bg-pink-300/70 shadow-[0_0_5px_rgba(255,182,193,0.6)]"
          style={{
            left: sakura.left,
            width: sakura.width,
            height: sakura.height,
            borderRadius: "100% 0px",
            animation: `sakuraFall ${sakura.animationDuration}s linear ${sakura.animationDelay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
