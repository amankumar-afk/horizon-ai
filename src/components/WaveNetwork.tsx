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
      timeRef.current += 0.006;
      const t = timeRef.current;

      const waveCount = 28;
      const baseSpacing = h / (waveCount - 1);
      const mouseRadius = 220;

      for (let i = 0; i < waveCount; i++) {
        const baseY = (i / (waveCount - 1)) * h;
        
        // Distance from edges — waves near top/bottom are bolder
        const edgeFactor = 1 - Math.abs(i - waveCount / 2) / (waveCount / 2);
        const edgeOpacity = 0.06 + (1 - edgeFactor) * 0.18;
        const lineWidth = 0.6 + (1 - edgeFactor) * 1.2;

        // Each wave has a unique phase and frequency
        const freq = 0.008 + Math.sin(i * 0.5) * 0.003;
        const amp = 12 + Math.sin(i * 0.7 + t) * 8 + (1 - edgeFactor) * 15;
        const phase = i * 0.6 + t * (0.8 + i * 0.05);

        ctx.beginPath();

        const step = 3;
        for (let x = -10; x <= w + 10; x += step) {
          // Base wave
          let y = baseY +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 2.3 + phase * 1.4 + i) * amp * 0.3 +
            Math.cos(x * freq * 0.5 + t * 0.5 + i * 0.3) * amp * 0.2;

          // Mouse distortion — waves ripple away from cursor
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            const pushAngle = Math.atan2(dy, dx);
            const displacement = force * force * 50;
            y += Math.sin(pushAngle) * displacement;
            // Add ripple rings
            y += Math.sin(dist * 0.08 - t * 4) * force * 12;
          }

          if (x === -10) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Determine if near mouse for glow boost
        const waveMidDist = Math.abs(baseY - mouse.y);
        const mouseGlow = waveMidDist < mouseRadius * 0.8
          ? (1 - waveMidDist / (mouseRadius * 0.8)) * 0.35
          : 0;

        const alpha = Math.min(edgeOpacity + mouseGlow, 0.55);

        ctx.strokeStyle = `rgba(210, 48, 48, ${alpha})`;
        ctx.lineWidth = lineWidth + mouseGlow * 2;
        ctx.stroke();

        // Draw dots at wave peaks near mouse
        if (mouseGlow > 0.05) {
          for (let x = 0; x < w; x += 40) {
            let y = baseY +
              Math.sin(x * freq + phase) * amp +
              Math.sin(x * freq * 2.3 + phase * 1.4 + i) * amp * 0.3 +
              Math.cos(x * freq * 0.5 + t * 0.5 + i * 0.3) * amp * 0.2;

            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouseRadius) {
              const force = (mouseRadius - dist) / mouseRadius;
              y += Math.sin(Math.atan2(dy, dx)) * force * force * 50;
              y += Math.sin(dist * 0.08 - t * 4) * force * 12;

              ctx.beginPath();
              ctx.arc(x, y, 1.5 + force * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(210, 48, 48, ${force * 0.5})`;
              ctx.fill();
            }
          }
        }
      }

      // Vertical cross-waves (subtle, perpendicular energy)
      const vWaveCount = 12;
      for (let i = 0; i < vWaveCount; i++) {
        const baseX = (i / (vWaveCount - 1)) * w;
        const edgeFactor = 1 - Math.abs(i - vWaveCount / 2) / (vWaveCount / 2);
        const alpha = 0.02 + (1 - edgeFactor) * 0.06;
        const freq = 0.01 + Math.cos(i * 0.8) * 0.004;
        const amp = 8 + (1 - edgeFactor) * 10;
        const phase = i * 0.8 + t * 0.6;

        ctx.beginPath();
        for (let y = -10; y <= h + 10; y += 4) {
          const x = baseX + Math.sin(y * freq + phase) * amp +
            Math.cos(y * freq * 1.8 + phase * 0.7) * amp * 0.3;

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let fx = x;
          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            fx += Math.cos(Math.atan2(dy, dx)) * force * force * 30;
          }

          if (y === -10) ctx.moveTo(fx, y);
          else ctx.lineTo(fx, y);
        }

        const waveMidDist = Math.abs(baseX - mouse.x);
        const mouseGlow = waveMidDist < mouseRadius
          ? (1 - waveMidDist / mouseRadius) * 0.12
          : 0;

        ctx.strokeStyle = `rgba(210, 48, 48, ${alpha + mouseGlow})`;
        ctx.lineWidth = 0.5 + mouseGlow * 1.5;
        ctx.stroke();
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
