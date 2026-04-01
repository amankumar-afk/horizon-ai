import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const fadeInRef = useRef(0);

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
      initNodes();
    };

    const initNodes = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const spacing = 70;
      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;
      const nodes: Node[] = [];

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * spacing + (row % 2 === 0 ? 0 : spacing * 0.5);
          const y = row * spacing * 0.866;
          // Add organic jitter
          const jx = x + (Math.random() - 0.5) * spacing * 0.4;
          const jy = y + (Math.random() - 0.5) * spacing * 0.4;

          // Density falloff toward center for breathing room
          const cx = w * 0.5, cy = h * 0.5;
          const distToCenter = Math.sqrt((jx - cx) ** 2 + (jy - cy) ** 2);
          const maxDist = Math.sqrt(cx * cx + cy * cy);
          const centerFactor = distToCenter / maxDist;
          
          // Skip some nodes near center to keep it airy
          if (centerFactor < 0.25 && Math.random() > 0.3) continue;
          if (centerFactor < 0.4 && Math.random() > 0.6) continue;

          nodes.push({
            x: jx, y: jy,
            originX: jx, originY: jy,
            vx: 0, vy: 0,
            radius: 1.2 + Math.random() * 1.3,
            opacity: 0.08 + centerFactor * 0.35,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.3 + Math.random() * 0.5,
          });
        }
      }
      nodesRef.current = nodes;
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

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      timeRef.current += 0.008;
      fadeInRef.current = Math.min(fadeInRef.current + 0.015, 1);
      const t = timeRef.current;
      const globalAlpha = fadeInRef.current;

      const mouseRadius = 180;

      // Update nodes
      for (const n of nodes) {
        // Gentle organic breathing motion
        const breathX = Math.sin(t * n.pulseSpeed + n.pulsePhase) * 3;
        const breathY = Math.cos(t * n.pulseSpeed * 0.7 + n.pulsePhase + 1) * 3;

        let targetX = n.originX + breathX;
        let targetY = n.originY + breathY;

        // Mouse repulsion + attraction ring
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mouseInfluence = 0;
        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          mouseInfluence = force;
          // Inner zone: attract; outer zone: gentle push
          if (dist < mouseRadius * 0.4) {
            targetX += dx * force * 0.15;
            targetY += dy * force * 0.15;
          } else {
            targetX -= dx * force * 0.06;
            targetY -= dy * force * 0.06;
          }
        }

        // Spring physics to target
        n.vx += (targetX - n.x) * 0.04;
        n.vy += (targetY - n.y) * 0.04;
        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;

        // Pulsing glow near mouse
        const pulse = Math.sin(t * 3 + n.pulsePhase) * 0.5 + 0.5;
        const drawOpacity = (n.opacity + mouseInfluence * 0.5 + pulse * mouseInfluence * 0.2) * globalAlpha;
        const drawRadius = n.radius + mouseInfluence * 2;

        // Draw node with glow
        if (mouseInfluence > 0.3) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, drawRadius * 3, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, drawRadius * 3);
          glow.addColorStop(0, `rgba(210, 48, 48, ${drawOpacity * 0.15})`);
          glow.addColorStop(1, `rgba(210, 48, 48, 0)`);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 48, 48, ${drawOpacity})`;
        ctx.fill();
      }

      // Draw connections — triangulated mesh look
      const maxConn = 130;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxConn) continue;

          const falloff = 1 - dist / maxConn;

          // Boost near mouse
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const mdx = mouse.x - midX;
          const mdy = mouse.y - midY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          const mouseBoost = mDist < mouseRadius ? (mouseRadius - mDist) / mouseRadius * 0.25 : 0;

          // Traveling pulse along line
          const pulseT = (Math.sin(t * 1.5 + i * 0.03 + j * 0.02) + 1) * 0.5;
          const hasPulse = pulseT > 0.92;

          const lineOpacity = (falloff * 0.1 + mouseBoost + (hasPulse ? 0.12 : 0)) * globalAlpha;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(210, 48, 48, ${lineOpacity})`;
          ctx.lineWidth = hasPulse ? 1.2 : 0.5;
          ctx.stroke();

          // Draw traveling pulse dot
          if (hasPulse && mouseBoost > 0) {
            const px = a.x + (b.x - a.x) * pulseT;
            const py = a.y + (b.y - a.y) * pulseT;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 48, 48, ${0.6 * globalAlpha})`;
            ctx.fill();
          }
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

export default ParticleNetwork;
