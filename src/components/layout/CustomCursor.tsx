"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isCanvas, setIsCanvas] = useState(false);

  const cursorX = useSpring(0, { damping: 25, stiffness: 250 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 250 });

  useEffect(() => {
    setMounted(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.closest("button") ||
          target.closest("a") ||
          target.closest('[role="button"]') ||
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          window.getComputedStyle(target).cursor === "pointer";

        const isInCanvas = Boolean(target.closest("canvas"));

        setIsPointer(Boolean(isClickable));
        setIsCanvas(isInCanvas);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-[#e2c08d]/50 pointer-events-none flex items-center justify-center backdrop-blur-[1px]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isCanvas ? 54 : isPointer ? 44 : 26,
          height: isCanvas ? 54 : isPointer ? 44 : 26,
          borderColor: isCanvas ? "rgba(226, 192, 141, 0.8)" : isPointer ? "rgba(255, 255, 255, 0.8)" : "rgba(226, 192, 141, 0.4)",
          backgroundColor: isPointer ? "rgba(226, 192, 141, 0.08)" : "rgba(226, 192, 141, 0)",
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {isCanvas && (
          <span className="text-[8px] tracking-widest text-[#e2c08d] font-mono uppercase">
            3D
          </span>
        )}
      </motion.div>

      {/* Center dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#e2c08d] pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isPointer ? 0.6 : 1,
          opacity: isCanvas ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}

