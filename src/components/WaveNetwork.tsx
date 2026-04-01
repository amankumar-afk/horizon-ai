import { useEffect, useRef, useCallback } from "react";

interface Ripple {
  x: number;
  y: number;
  birth: number;
}

const WaveNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothMouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const ripplesRef = useRef<Ripple[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    ripplesRef.current.push({ x: e.clientX, y: e.clientY, birth: timeRef.current });
    if (ripplesRef.current.length > 4) ripplesRef.current.shift();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Grid: wide and deep for full-width terrain
    const COLS = 200;
    const ROWS = 100;
    const SPACING = 12;

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += 0.008;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const smooth = smoothMouseRef.current;

      if (mouse.x > 0) {
        smooth.x += (mouse.x - smooth.x) * 0.04;
        smooth.y += (mouse.y - smooth.y) * 0.04;
      }

      // Camera: low angle looking across the terrain
      const horizonY = h * 0.25;
      const focalLen = 250;
      const cameraHeight = 90;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const worldX = (col - COLS / 2) * SPACING;
          const worldZ = (row + 1) * SPACING;

          // Gentle rolling waves
          let elevation = 0;
          elevation += Math.sin(worldX * 0.008 + t * 0.6) * 18;
          elevation += Math.sin(worldZ * 0.012 - t * 0.4) * 14;
          elevation += Math.sin((worldX + worldZ) * 0.006 + t * 0.3) * 10;
          elevation += Math.sin(worldX * 0.02 - t * 0.8) * 6;
          elevation += Math.sin(worldZ * 0.025 + t * 0.5) * 5;

          // Mouse influence — gentle hill under cursor
          if (smooth.x > 0) {
            const mWorldX = (smooth.x - w / 2) * (worldZ + focalLen) / focalLen;
            const mWorldZ = Math.max(20, (horizonY - smooth.y) * 4);
            const dx = worldX - mWorldX;
            const dz = worldZ - mWorldZ;
            const mDist = Math.sqrt(dx * dx + dz * dz);
            const influence = Math.max(0, 1 - mDist / 400);
            elevation += influence * influence * 35;
          }

          // Ripples
          for (const ripple of ripplesRef.current) {
            const age = t - ripple.birth;
            const rWorldX = (ripple.x - w / 2) * (worldZ + focalLen) / focalLen;
            const rWorldZ = Math.max(20, (horizonY - ripple.y) * 4);
            const dx = worldX - rWorldX;
            const dz = worldZ - rWorldZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const waveR = age * 200;
            const ringD = Math.abs(dist - waveR);
            if (ringD < 80) {
              const fade = Math.max(0, 1 - age / 2.5);
              elevation += Math.sin(ringD * 0.08) * (1 - ringD / 80) * fade * 30;
            }
          }

          // 3D projection — perspective divide
          const scale = focalLen / (worldZ + focalLen);
          const screenX = w / 2 + worldX * scale;
          const screenY = horizonY + (cameraHeight - elevation) * scale;

          if (screenX < -10 || screenX > w + 10 || screenY < -10 || screenY > h + 10) continue;

          // Depth fade: closer rows (higher screenY) = brighter
          const depthNorm = Math.min(1, scale * 2.5);
          const verticalNorm = Math.max(0, (screenY - horizonY) / (h - horizonY));

          const dotRadius = Math.max(0.4, 1.8 * scale * (1 + verticalNorm * 0.3));
          const alpha = depthNorm * (0.15 + verticalNorm * 0.55);

          // Red dots
          const r = 180 + Math.round(verticalNorm * 50);
          const g = 30 + Math.round(verticalNorm * 15);
          const b = 30 + Math.round(verticalNorm * 15);

          ctx.beginPath();
          ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }
      }

      // Cleanup old ripples
      ripplesRef.current = ripplesRef.current.filter(r => t - r.birth < 2.5);

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
};

export default WaveNetwork;
