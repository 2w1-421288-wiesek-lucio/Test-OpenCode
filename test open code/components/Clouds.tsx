"use client";

import { useEffect, useRef } from "react";

interface Cloud {
  id: number;
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
}

const CLOUD_COUNT = 5;

function createCloud(id: number, startX?: number): Cloud {
  return {
    id,
    x: startX ?? 800 + Math.random() * 400,
    y: 30 + Math.random() * 200,
    width: 80 + Math.random() * 100,
    speed: 0.3 + Math.random() * 0.4,
    opacity: 0.6 + Math.random() * 0.4,
  };
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud) {
  const { x, y, width, opacity } = cloud;
  const h = width * 0.5;

  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.beginPath();
  ctx.ellipse(x, y, width * 0.5, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x - width * 0.25, y + h * 0.1, width * 0.35, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + width * 0.25, y + h * 0.05, width * 0.3, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x - width * 0.1, y - h * 0.2, width * 0.25, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + width * 0.1, y - h * 0.15, width * 0.28, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

export default function Clouds() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<Cloud[]>(
    Array.from({ length: CLOUD_COUNT }, (_, i) => createCloud(i, Math.random() * 800))
  );
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    function animate() {
      ctx.clearRect(0, 0, 800, 600);

      cloudsRef.current = cloudsRef.current.map((cloud) => {
        const newX = cloud.x - cloud.speed;
        if (newX + cloud.width < 0) {
          return createCloud(cloud.id);
        }
        return { ...cloud, x: newX };
      });

      for (const cloud of cloudsRef.current) {
        drawCloud(ctx, cloud);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
