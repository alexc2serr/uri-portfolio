"use client";

import React, { useEffect, useRef } from "react";

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
}

const GOLD_PALETTE = [
  "rgba(226, 192, 141,", // Base gold #e2c08d
  "rgba(255, 235, 198,", // Warm soft bright gold
  "rgba(240, 210, 160,", // Amber gold
  "rgba(255, 255, 255,", // Pure white twinkle core
];

export default function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: SparkleParticle[] = [];
    let lastX = 0;
    let lastY = 0;
    let isFirstMove = true;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw a 4-pointed lens flare / photography sparkle
    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      rotation: number
    ) => {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    };

    const addParticles = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const colorBase = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
        const isStar = Math.random() > 0.4; // 60% are 4-pointed stars, 40% are glowing dust motes
        const size = isStar ? Math.random() * 4 + 3 : Math.random() * 2.5 + 1.2;

        // Slight drift around cursor
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;

        particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.2, // Float subtly upward
          size,
          alpha: Math.random() * 0.4 + 0.6,
          decay: Math.random() * 0.015 + 0.012,
          color: colorBase,
          isStar,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      if (isFirstMove) {
        lastX = x;
        lastY = y;
        isFirstMove = false;
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.hypot(dx, dy);

      // Spawn particles proportional to mouse distance travelled
      if (distance > 6) {
        const count = Math.min(Math.floor(distance / 7), 3);
        addParticles(x, y, count);
        lastX = x;
        lastY = y;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalCompositeOperation = "lighter"; // Luminous blend for star glow

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;

        if (p.isStar) {
          // Draw 4-point photography sparkle
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.25, p.rotation);
        } else {
          // Draw glowing particle dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 hidden md:block"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

