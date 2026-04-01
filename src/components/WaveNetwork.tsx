import { useEffect, useRef } from "react";

const WaveNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

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

      const mouse = mouseRef.current;
      timeRef.current += 0.003;
      const t = timeRef.current;
      const mouseRadius = 180;

      // === Horizontal parallel lines ===
      const hCount = 50;
      const hSpacing = h / (hCount - 1);

      for (let i = 0; i < hCount; i++) {
        const baseY = i * hSpacing;
        const edgeDist = Math.abs(i / (hCount - 1) - 0.5) * 2;
        const lineAlpha = 0.1 + edgeDist * 0.2;
        const lineWidth = 0.7 + edgeDist * 1.2;

        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 3) {
          let y = baseY;

          // Mouse hover → wavy distortion (same wave for all lines = stay parallel)
          const dx = x - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = 1 - dist / mouseRadius;
            const smooth = force * force * (3 - 2 * force);
            // Shared wave function — identical for every line → parallel displacement
            y += Math.sin(x * 0.025 + t * 3) * smooth * 18;
            y += Math.sin(x * 0.06 + t * 5) * smooth * 6;
            // Push away from cursor vertically
            y += (dy > 0 ? 1 : -1) * smooth * 12;
          }

          if (x === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveDist = Math.abs(baseY - mouse.y);
        const glow = waveDist < mouseRadius ? (1 - waveDist / mouseRadius) * 0.35 : 0;

        const r = 210 - edgeDist * 30;
        const g = 48 + (1 - edgeDist) * 40;
        const b = 48 + (1 - edgeDist) * 50;
        const alpha = Math.min(lineAlpha + glow, 0.6);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = lineWidth + glow * 1.5;
        ctx.stroke();
      }

      // === Vertical parallel lines ===
      const vCount = 20;
      const vSpacing = w / (vCount - 1);

      for (let i = 0; i < vCount; i++) {
        const baseX = i * vSpacing;
        const edgeDist = Math.abs(i / (vCount - 1) - 0.5) * 2;
        const lineAlpha = 0.02 + edgeDist * 0.05;
        const lineWidth = 0.3 + edgeDist * 0.4;

        ctx.beginPath();
        for (let y = -10; y <= h + 10; y += 4) {
          let x = baseX;

          const dx = baseX - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = 1 - dist / mouseRadius;
            const smooth = force * force * (3 - 2 * force);
            x += Math.sin(y * 0.025 + t * 3) * smooth * 18;
            x += Math.sin(y * 0.06 + t * 5) * smooth * 6;
            x += (dx > 0 ? 1 : -1) * smooth * 12;
          }

          if (y === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveDist = Math.abs(baseX - mouse.x);
        const glow = waveDist < mouseRadius ? (1 - waveDist / mouseRadius) * 0.1 : 0;

        ctx.strokeStyle = `rgba(210, 60, 60, ${lineAlpha + glow})`;
        ctx.lineWidth = lineWidth + glow * 1;
        ctx.stroke();
      }

      // === Subtle focus ring around cursor ===
      if (mouse.x > 0 && mouse.y > 0) {
        for (let r = 0; r < 2; r++) {
          const radius = 50 + r * 35 + Math.sin(t * 2 + r) * 4;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(210, 48, 48, ${0.035 - r * 0.012})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0, pointerEvents: "none" }}
    />
  );
};

export default WaveNetwork;
