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
  const fadeInRef = useRef(0); // 0 to 1 over ~2s

  const handleClick = useCallback((e: MouseEvent) => {
    ripplesRef.current.push({ x: e.clientX, y: e.clientY, birth: timeRef.current });
    if (ripplesRef.current.length > 5) ripplesRef.current.shift();
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

    const COLS = 160;
    const ROWS = 80;
    const SPACING = 14;

    const startTime = performance.now();

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Fade-in: dots materialize back-to-front over ~2s
      const elapsed = (performance.now() - startTime) / 1000;
      fadeInRef.current = Math.min(1, elapsed / 1.8);

      timeRef.current += 0.006;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const smooth = smoothMouseRef.current;

      if (mouse.x > 0) {
        smooth.x += (mouse.x - smooth.x) * 0.03;
        smooth.y += (mouse.y - smooth.y) * 0.03;
      }

      // 3D projection settings — terrain in lower portion
      const horizonY = h * 0.35;
      const focalLen = 280;
      const cameraHeight = 70;

      for (let row = 0; row < ROWS; row++) {
        // Fade-in sweep: back rows appear first
        const rowFadeThreshold = (1 - row / ROWS) * 0.7;
        const rowOpacity = Math.min(1, Math.max(0, (fadeInRef.current - rowFadeThreshold) / 0.3));
        if (rowOpacity <= 0) continue;

        for (let col = 0; col < COLS; col++) {
          const worldX = (col - COLS / 2) * SPACING;
          const worldZ = (row + 1) * SPACING;

          // Multi-layered sine waves for organic motion
          let elevation = 0;
          elevation += Math.sin(worldX * 0.007 + t * 0.5) * 20;
          elevation += Math.sin(worldZ * 0.01 - t * 0.35) * 16;
          elevation += Math.sin((worldX + worldZ) * 0.005 + t * 0.25) * 12;
          elevation += Math.sin(worldX * 0.018 - t * 0.7) * 7;
          elevation += Math.sin(worldZ * 0.022 + t * 0.45) * 6;
          elevation += Math.sin(worldX * 0.003 + worldZ * 0.004 - t * 0.15) * 10;

          // Mouse parallax — subtle hill under cursor
          if (smooth.x > 0) {
            const mWorldX = (smooth.x - w / 2) * (worldZ + focalLen) / focalLen;
            const mWorldZ = Math.max(20, (horizonY - smooth.y) * 3.5);
            const dx = worldX - mWorldX;
            const dz = worldZ - mWorldZ;
            const mDist = Math.sqrt(dx * dx + dz * dz);
            const influence = Math.max(0, 1 - mDist / 350);
            elevation += influence * influence * 30;
          }

          // Ripple effects
          for (const ripple of ripplesRef.current) {
            const age = t - ripple.birth;
            const rWorldX = (ripple.x - w / 2) * (worldZ + focalLen) / focalLen;
            const rWorldZ = Math.max(20, (horizonY - ripple.y) * 3.5);
            const dx = worldX - rWorldX;
            const dz = worldZ - rWorldZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const waveR = age * 180;
            const ringD = Math.abs(dist - waveR);
            if (ringD < 100) {
              const fade = Math.max(0, 1 - age / 3);
              elevation += Math.sin(ringD * 0.06) * (1 - ringD / 100) * fade * 40;
            }
          }

          // 3D perspective projection
          const scale = focalLen / (worldZ + focalLen);
          const screenX = w * 0.35 + worldX * scale; // Center terrain on left side
          const screenY = horizonY + (cameraHeight - elevation) * scale;

          if (screenX < -20 || screenX > w + 20 || screenY < -20 || screenY > h + 20) continue;

          // Depth-based styling
          const depthNorm = Math.min(1, scale * 2.2);
          const verticalNorm = Math.max(0, (screenY - horizonY) / (h - horizonY));

          // Dot size: small but visible
          const dotRadius = Math.max(0.6, 2.0 * scale * (0.8 + verticalNorm * 0.4));

          // Opacity: far dots 10-30%, near dots 60-100%
          const baseAlpha = depthNorm * (0.1 + verticalNorm * 0.6);
          const alpha = baseAlpha * rowOpacity;

          // Glow on wave peaks (higher elevation = brighter)
          const peakGlow = Math.max(0, elevation - 20) / 40;
          const finalAlpha = Math.min(1, alpha + peakGlow * 0.3 * rowOpacity);

          // Brand red #D23030 = rgb(210, 48, 48)
          ctx.beginPath();
          ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,48,48,${finalAlpha})`;
          ctx.fill();

          // Soft bloom/halo on wave crests
          if (peakGlow > 0.3 && verticalNorm > 0.2) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, dotRadius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210,48,48,${peakGlow * 0.08 * rowOpacity})`;
            ctx.fill();
          }
        }
      }

      // Cleanup old ripples
      ripplesRef.current = ripplesRef.current.filter(r => t - r.birth < 3);

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
      className="absolute inset-0"
      style={{ zIndex: 0 }}
    />
  );
};

export default WaveNetwork;
