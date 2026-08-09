 "use client";

 import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from "react";
 import { cn } from "@/lib/utils";

 interface Sparkle {
   id: number;
   x: number;
   y: number;
   size: number;
 }

 export function GlassCard({
   children,
   className,
 }: {
   children: ReactNode;
   className?: string;
 }) {
   const ref = useRef<HTMLDivElement>(null);
   const [sparkles, setSparkles] = useState<Sparkle[]>([]);
   const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });
   const idRef = useRef(0);

   const handleMouseMove = useCallback((e: MouseEvent) => {
     if (!ref.current) return;
     const rect = ref.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     setGlow({ x, y, visible: true });

     if (Math.random() > 0.6) {
       const id = ++idRef.current;
       const size = Math.random() * 10 + 5;
       setSparkles((prev) => [...prev.slice(-12), { id, x, y, size }]);
       setTimeout(() => {
         setSparkles((prev) => prev.filter((s) => s.id !== id));
       }, 650);
     }
   }, []);

   const handleMouseLeave = useCallback(() => {
     setGlow((g) => ({ ...g, visible: false }));
     setSparkles([]);
   }, []);

   return (
     <div
       ref={ref}
       className={cn("glass-card overflow-hidden", className)}
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
     >
       {/* Mouse-following radial glow */}
       <div
         className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
         style={{
           opacity: glow.visible ? 1 : 0,
           background: `radial-gradient(250px circle at ${glow.x}px ${glow.y}px, rgba(255,255,255,0.07), transparent 60%)`,
         }}
       />

       {/* Sparkle particles */}
       {sparkles.map((s) => (
         <span
           key={s.id}
           className="glass-sparkle"
           style={{
             left: s.x - s.size / 2,
             top: s.y - s.size / 2,
             width: s.size,
             height: s.size,
           }}
         />
       ))}

       {children}
     </div>
   );
 }
