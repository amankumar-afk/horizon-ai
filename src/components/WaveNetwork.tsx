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
    ripplesRef.current.push({
      x: e.clientX,
      y: e.clientY,
      birth: timeRef.current,
    });
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

    // Grid parameters
    const gridSpacing = 22;
    const cols = 120;
    const rows = 90;

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += 0.015;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const smooth = smoothMouseRef.current;

      // Smooth mouse
      if (mouse.x > 0) {
        smooth.x += (mouse.x - smooth.x) * 0.05;
        smooth.y += (mouse.y - smooth.y) * 0.05;
      }

      // Focal point follows mouse (or defaults to center)
      const focalX = smooth.x > 0 ? smooth.x : w / 2;
      const focalY = smooth.y > 0 ? smooth.y : h / 2;

      // 3D perspective parameters
      const vanishY = h * 0.45; // horizon line
      const eyeHeight = 300;
      const perspectiveStrength = 600;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Grid position in world space (centered)
          const worldX = (col - cols / 2) * gridSpacing;
          const worldZ = row * gridSpacing + 20;

          // Wave displacement in Y (height)
          const distFromFocalWorld = Math.sqrt(
            (worldX - (focalX - w / 2)) ** 2 + (worldZ - (focalY - vanishY + 200)) ** 2
          );

          // Concentric waves from focal point
          let waveY = Math.sin(distFromFocalWorld * 0.04 - t * 2) * 15 *
            Math.max(0, 1 - distFromFocalWorld / 800);

          // Ambient flowing wave
          waveY += Math.sin(worldX * 0.02 + t * 0.5) * 4;
          waveY += Math.sin(worldZ * 0.015 + t * 0.3) * 3;

          // Click ripples
          for (const ripple of ripplesRef.current) {
            const age = t - ripple.birth;
            const rippleDist = Math.sqrt(
              (worldX - (ripple.x - w / 2)) ** 2 +
              (worldZ - (ripple.y - vanishY + 200)) ** 2
            );
            const waveRadius = age * 150;
            const ringDist = Math.abs(rippleDist - waveRadius);
            const ringWidth = 100;
            if (ringDist < ringWidth) {
              const fade = Math.max(0, 1 - age / 3);
              const ringForce = (1 - ringDist / ringWidth) * fade;
              waveY += Math.sin(ringDist * 0.06) * ringForce * 25;
            }
          }

          // Project 3D → 2D with perspective
          const worldYPos = -waveY;
          const scale = perspectiveStrength / (worldZ + perspectiveStrength);
          const screenX = w / 2 + worldX * scale;
          const screenY = vanishY + (worldYPos + eyeHeight) * scale;

          // Skip if off screen
          if (screenX < -20 || screenX > w + 20 || screenY < -20 || screenY > h + 20) continue;

          // Distance from focal for glow
          const screenDx = screenX - focalX;
          const screenDy = screenY - focalY;
          const screenDist = Math.sqrt(screenDx * screenDx + screenDy * screenDy);

          // Depth-based properties
          const depthFade = Math.min(1, scale * 1.8);
          const baseSize = Math.max(0.5, 2.5 * scale);

          // Focal glow boost
          const focalRadius = 250;
          const focalBoost = screenDist < focalRadius
            ? (1 - screenDist / focalRadius)
            : 0;

          const dotSize = baseSize + focalBoost * 2.5 * scale;
          const dotAlpha = depthFade * (0.12 + focalBoost * 0.55);

          // Color: red core, softer rose at distance
          const r = 200 + focalBoost * 30;
          const g = 40 + (1 - focalBoost) * 30;
          const b = 40 + (1 - focalBoost) * 40;

          // Glow halo for close-to-focal dots
          if (focalBoost > 0.3 && depthFade > 0.3) {
            const glowSize = dotSize * 4;
            const gradient = ctx.createRadialGradient(
              screenX, screenY, 0,
              screenX, screenY, glowSize
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${focalBoost * depthFade * 0.15})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.beginPath();
            ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }

          // Core dot
          ctx.beginPath();
          ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dotAlpha})`;
          ctx.fill();
        }
      }

      // Central glow aura at focal point
      if (smooth.x > 0) {
        const gradient = ctx.createRadialGradient(
          focalX, focalY, 0,
          focalX, focalY, 180
        );
        gradient.addColorStop(0, "rgba(210, 48, 48, 0.06)");
        gradient.addColorStop(0.4, "rgba(210, 48, 48, 0.02)");
        gradient.addColorStop(1, "rgba(210, 48, 48, 0)");
        ctx.beginPath();
        ctx.arc(focalX, focalY, 180, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Cleanup ripples
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
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
};

export default WaveNetwork;
