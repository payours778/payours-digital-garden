"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Firefly {
  id: number;
  top: string;
  left: string;
  width: number;
  height: number;
  animationDuration: number;
  animationDelay: number;
  floatAnimation: string;
}

export function FireflyEffect() {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setIsMounted(true);
    const generateFireflies = () => {
      const newFireflies: Firefly[] = [];
      const floatAnimations = ["float1", "float2", "float3", "float4"];

      for (let i = 0; i < 12; i++) {
        newFireflies.push({
          id: i,
          top: `${20 + Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
          width: 3 + Math.random() * 4,
          height: 3 + Math.random() * 4,
          animationDuration: 4 + Math.random() * 5,
          animationDelay: Math.random() * 10,
          floatAnimation: floatAnimations[Math.floor(Math.random() * 4)],
        });
      }
      return newFireflies;
    };

    setFireflies(generateFireflies());
  }, []);

  if (!isMounted) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000"
      style={{ opacity: isDark ? 1 : 0 }}
    >
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className="absolute"
          style={{
            top: firefly.top,
            left: firefly.left,
            animation: `${firefly.floatAnimation} ${20 + Math.random() * 15}s ease-in-out ${firefly.animationDelay}s infinite`,
          }}
        >
          <div
            className="rounded-full bg-green-300/90"
            style={{
              width: firefly.width,
              height: firefly.height,
              animation: `fireflyBreathe ${firefly.animationDuration}s ease-in-out ${firefly.animationDelay}s infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
