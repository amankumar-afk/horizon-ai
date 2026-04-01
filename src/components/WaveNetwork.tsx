import { useEffect, useRef, useCallback } from "react";

interface Ripple {
  x: number;
  y: number;
  birth: number;
  strength: number;
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
      strength: 1,
    });
    // Keep max 5 ripples
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

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += 0.001;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const smooth = smoothMouseRef.current;

      // Smooth mouse follow — gives a laggy, luxurious feel
      smooth.x += (mouse.x - smooth.x) * 0.06;
      smooth.y += (mouse.y - smooth.y) * 0.06;

      const mouseRadius = 250;
      const spacing = 28; // Grid cell size
      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;

      // Precompute displaced grid intersections
      const getDisplacement = (gx: number, gy: number): [number, number] => {
        let dx = 0;
        let dy = 0;

        // Mouse warp — fabric stretches toward cursor
        const mx = gx - smooth.x;
        const my = gy - smooth.y;
        const mDist = Math.sqrt(mx * mx + my * my);
        if (mDist < mouseRadius && mDist > 0) {
          const force = 1 - mDist / mouseRadius;
          const smooth3 = force * force * force; // cubic ease — very gentle at edges
          dx += (mx / mDist) * smooth3 * -18;
          dy += (my / mDist) * smooth3 * -18;
        }

        // Click ripples
        for (const ripple of ripplesRef.current) {
          const age = (t - ripple.birth) * 300;
          const rx = gx - ripple.x;
          const ry = gy - ripple.y;
          const rDist = Math.sqrt(rx * rx + ry * ry);
          const waveRadius = age * 1.8;
          const ringDist = Math.abs(rDist - waveRadius);
          const ringWidth = 80;

          if (ringDist < ringWidth) {
            const fade = Math.max(0, 1 - age / 400); // die after ~400
            const ringForce = (1 - ringDist / ringWidth) * fade * ripple.strength;
            const angle = Math.atan2(ry, rx);
            const displacement = Math.sin(ringDist * 0.08) * ringForce * 12;
            dx += Math.cos(angle) * displacement;
            dy += Math.sin(angle) * displacement;
          }
        }

        return [dx, dy];
      };

      // === Draw horizontal lines ===
      for (let row = -1; row <= rows; row++) {
        const baseY = row * spacing;
        const edgeDist = Math.abs((baseY / h) - 0.5) * 2;
        const baseAlpha = 0.06 + edgeDist * 0.08;

        ctx.beginPath();
        let started = false;
        for (let col = -1; col <= cols; col++) {
          const baseX = col * spacing;
          const [dx, dy] = getDisplacement(baseX, baseY);

          if (!started) {
            ctx.moveTo(baseX + dx, baseY + dy);
            started = true;
          } else {
            ctx.lineTo(baseX + dx, baseY + dy);
          }
        }

        // Mouse proximity glow
        const rowDist = Math.abs(baseY - smooth.y);
        const glow = rowDist < mouseRadius
          ? (1 - rowDist / mouseRadius) * 0.15
          : 0;

        ctx.strokeStyle = `rgba(200, 50, 50, ${baseAlpha + glow})`;
        ctx.lineWidth = 0.4 + glow * 0.8;
        ctx.stroke();
      }

      // === Draw vertical lines ===
      for (let col = -1; col <= cols; col++) {
        const baseX = col * spacing;
        const edgeDist = Math.abs((baseX / w) - 0.5) * 2;
        const baseAlpha = 0.06 + edgeDist * 0.08;

        ctx.beginPath();
        let started = false;
        for (let row = -1; row <= rows; row++) {
          const baseY = row * spacing;
          const [dx, dy] = getDisplacement(baseX, baseY);

          if (!started) {
            ctx.moveTo(baseX + dx, baseY + dy);
            started = true;
          } else {
            ctx.lineTo(baseX + dx, baseY + dy);
          }
        }

        const colDist = Math.abs(baseX - smooth.x);
        const glow = colDist < mouseRadius
          ? (1 - colDist / mouseRadius) * 0.15
          : 0;

        ctx.strokeStyle = `rgba(200, 50, 50, ${baseAlpha + glow})`;
        ctx.lineWidth = 0.4 + glow * 0.8;
        ctx.stroke();
      }

      // === Subtle intersection dots near mouse ===
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const baseX = col * spacing;
          const baseY = row * spacing;
          const mx = baseX - smooth.x;
          const my = baseY - smooth.y;
          const mDist = Math.sqrt(mx * mx + my * my);

          if (mDist < mouseRadius * 0.6) {
            const [dx, dy] = getDisplacement(baseX, baseY);
            const force = 1 - mDist / (mouseRadius * 0.6);
            const dotAlpha = force * force * 0.3;
            const dotSize = 1 + force * 1.5;

            ctx.beginPath();
            ctx.arc(baseX + dx, baseY + dy, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 48, 48, ${dotAlpha})`;
            ctx.fill();
          }
        }
      }

      // Clean up expired ripples
      ripplesRef.current = ripplesRef.current.filter(
        r => (t - r.birth) * 300 < 400
      );

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
