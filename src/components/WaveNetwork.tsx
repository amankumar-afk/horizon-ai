import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  layer: number; // 0-2, simulates neural network depth
}

const WaveNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
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

    // Initialize nodes in a neural-network-like distribution
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nodeCount = 120;
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const layer = i < nodeCount * 0.3 ? 0 : i < nodeCount * 0.65 ? 1 : 2;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        layer,
      });
    }
    nodesRef.current = nodes;

    const connectionDist = 160;
    const mouseRadius = 220;

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      timeRef.current += 0.008;
      const t = timeRef.current;
      const nodes = nodesRef.current;

      // Update node positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Soft boundary bounce
        if (node.x < -20) node.vx = Math.abs(node.vx);
        if (node.x > w + 20) node.vx = -Math.abs(node.vx);
        if (node.y < -20) node.vy = Math.abs(node.vy);
        if (node.y > h + 20) node.vy = -Math.abs(node.vy);

        // Mouse attraction — nodes drift toward cursor
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 0.008;
          node.vx += dx * force;
          node.vy += dy * force;
        }

        // Damping
        node.vx *= 0.995;
        node.vy *= 0.995;
      }

      // Draw connections — "synapses"
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const strength = 1 - dist / connectionDist;

            // Mouse proximity boost for connection
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mouseDx = midX - mouse.x;
            const mouseDy = midY - mouse.y;
            const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            const mouseBoost = mouseDist < mouseRadius
              ? (1 - mouseDist / mouseRadius) * 0.4
              : 0;

            const alpha = strength * 0.12 + mouseBoost * strength;

            // Data pulse traveling along connection
            const pulsePos = (Math.sin(t * 2 + i * 0.3 + j * 0.2) + 1) / 2;
            const pulseX = a.x + (b.x - a.x) * pulsePos;
            const pulseY = a.y + (b.y - a.y) * pulsePos;

            // Connection line
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(210, 48, 48, ${alpha})`;
            ctx.lineWidth = 0.5 + strength * 0.8 + mouseBoost * 1;
            ctx.stroke();

            // Pulse dot on connection (only for visible ones near mouse)
            if (mouseBoost > 0.05 && strength > 0.3) {
              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 1 + mouseBoost * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(210, 48, 48, ${0.3 + mouseBoost * 0.5})`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes — "neurons"
      for (const node of nodes) {
        const pulse = Math.sin(t * 1.5 + node.pulsePhase);
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseProximity = dist < mouseRadius ? 1 - dist / mouseRadius : 0;

        const baseAlpha = 0.15 + pulse * 0.05;
        const alpha = Math.min(baseAlpha + mouseProximity * 0.5, 0.8);
        const size = node.radius + pulse * 0.5 + mouseProximity * 3;

        // Outer glow for nodes near mouse
        if (mouseProximity > 0.15) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, size * 5
          );
          gradient.addColorStop(0, `rgba(210, 48, 48, ${mouseProximity * 0.12})`);
          gradient.addColorStop(1, "rgba(210, 48, 48, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Core node
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);

        // Layer-based coloring: deeper layers → warmer
        const layerShift = node.layer * 15;
        ctx.fillStyle = `rgba(${210 - layerShift}, ${48 + layerShift}, ${48 + layerShift * 2}, ${alpha})`;
        ctx.fill();

        // Bright ring on active nodes
        if (mouseProximity > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(210, 48, 48, ${mouseProximity * 0.25})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Cursor focus indicator
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, mouseRadius
        );
        gradient.addColorStop(0, "rgba(210, 48, 48, 0.03)");
        gradient.addColorStop(0.5, "rgba(210, 48, 48, 0.01)");
        gradient.addColorStop(1, "rgba(210, 48, 48, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
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
