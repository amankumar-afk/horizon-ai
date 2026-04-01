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
      timeRef.current += 0.004;
      const t = timeRef.current;
      const mouseRadius = 200;

      // === LAYER 1: Flowing topology lines (like contour/heatmap lines) ===
      const topoCount = 45;
      for (let i = 0; i < topoCount; i++) {
        const baseY = (i / (topoCount - 1)) * h;
        const normalizedI = i / (topoCount - 1);
        
        const edgeDist = Math.abs(normalizedI - 0.5) * 2;
        const lineAlpha = 0.04 + edgeDist * 0.14;
        const lineWidth = 0.5 + edgeDist * 1.0;

        // Unique wave signature per line
        const freq1 = 0.004 + Math.sin(i * 0.7) * 0.002;
        const freq2 = freq1 * 2.618; // golden ratio harmonic
        const amp = 18 + edgeDist * 25 + Math.sin(t * 0.3 + i * 0.5) * 6;
        const phase = i * 0.4 + t * (0.5 + i * 0.02);

        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 3) {
          let y = baseY
            + Math.sin(x * freq1 + phase) * amp
            + Math.sin(x * freq2 + phase * 1.3 + i * 0.8) * amp * 0.25
            + Math.cos(x * freq1 * 0.3 + t * 0.3) * amp * 0.15;

          // Mouse: gentle magnetic pull creating a "data lens" effect
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = 1 - dist / mouseRadius;
            const smoothForce = force * force * (3 - 2 * force); // smoothstep
            const angle = Math.atan2(dy, dx);
            y += Math.sin(angle) * smoothForce * 40;
            // Concentric ripple (like data waves emanating)
            y += Math.sin(dist * 0.05 - t * 3) * smoothForce * 8;
          }

          if (x === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Near-mouse glow
        const waveDist = Math.abs(baseY - mouse.y);
        const glow = waveDist < mouseRadius ? (1 - waveDist / mouseRadius) * 0.25 : 0;

        // Gradient color: warm red at edges → soft rose in center
        const r = 210 - edgeDist * 30;
        const g = 48 + (1 - edgeDist) * 40;
        const b = 48 + (1 - edgeDist) * 50;
        const alpha = Math.min(lineAlpha + glow, 0.45);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = lineWidth + glow * 1.5;
        ctx.stroke();
      }

      // === LAYER 2: Meridian lines (vertical, denser) ===
      const meridianCount = 16;
      for (let i = 0; i < meridianCount; i++) {
        const baseX = ((i + 0.5) / meridianCount) * w;
        const edgeDist = Math.abs((i + 0.5) / meridianCount - 0.5) * 2;
        const alpha = 0.02 + edgeDist * 0.06;
        const freq = 0.006 + Math.cos(i * 1.1) * 0.002;
        const amp = 8 + edgeDist * 14;
        const phase = i * 1.2 + t * 0.4;

        ctx.beginPath();
        for (let y = -10; y <= h + 10; y += 5) {
          let x = baseX + Math.sin(y * freq + phase) * amp
            + Math.cos(y * freq * 1.8 + phase * 0.6) * amp * 0.25;

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = 1 - dist / mouseRadius;
            x += Math.cos(Math.atan2(dy, dx)) * force * force * 25;
          }

          if (y === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(210, 60, 60, ${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }


      // === LAYER 4: Mouse focus ring — "analytical lens" ===
      if (mouse.x > 0 && mouse.y > 0) {
        for (let r = 0; r < 3; r++) {
          const radius = 60 + r * 40 + Math.sin(t * 2 + r) * 5;
          const alpha = 0.04 - r * 0.012;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(210, 48, 48, ${alpha})`;
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
