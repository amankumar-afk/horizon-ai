import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseX: number;
  baseY: number;
}

const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const pulseRef = useRef<{ x: number; y: number; radius: number; opacity: number }[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 6000);
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        // Bias particles toward corners/edges
        let x: number, y: number;
        const zone = Math.random();
        if (zone < 0.35) {
          // top-left corner
          x = Math.random() * canvas.width * 0.4;
          y = Math.random() * canvas.height * 0.4;
        } else if (zone < 0.7) {
          // bottom-right corner
          x = canvas.width * 0.6 + Math.random() * canvas.width * 0.4;
          y = canvas.height * 0.6 + Math.random() * canvas.height * 0.4;
        } else if (zone < 0.8) {
          // top-right
          x = canvas.width * 0.7 + Math.random() * canvas.width * 0.3;
          y = Math.random() * canvas.height * 0.3;
        } else if (zone < 0.9) {
          // bottom-left
          x = Math.random() * canvas.width * 0.3;
          y = canvas.height * 0.7 + Math.random() * canvas.height * 0.3;
        } else {
          // scattered elsewhere (sparse)
          x = Math.random() * canvas.width;
          y = Math.random() * canvas.height;
        }

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      particlesRef.current = particles;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      timeRef.current += 0.005;

      // Update & draw particles
      for (const p of particles) {
        // Gentle drift
        p.x += p.vx;
        p.y += p.vy;

        // Soft boundary bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Gentle return to base area
        p.vx += (p.baseX - p.x) * 0.0001;
        p.vy += (p.baseY - p.y) * 0.0001;

        // Mouse attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let drawOpacity = p.opacity;

        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx += dx * force * 0.0008;
          p.vy += dy * force * 0.0008;
          drawOpacity = Math.min(p.opacity + force * 0.4, 0.8);
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 48, 48, ${drawOpacity})`;
        ctx.fill();
      }

      // Draw connections
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.12;

            // Occasional pulse along connection
            const pulsePhase = Math.sin(timeRef.current * 2 + i * 0.1 + j * 0.05);
            const pulseBoost = pulsePhase > 0.95 ? 0.15 : 0;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(210, 48, 48, ${opacity + pulseBoost})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw pulse waves from logo area
      if (Math.random() < 0.003) {
        pulseRef.current.push({
          x: canvas.width * 0.25,
          y: canvas.height * 0.4,
          radius: 0,
          opacity: 0.08,
        });
      }

      for (let i = pulseRef.current.length - 1; i >= 0; i--) {
        const pulse = pulseRef.current[i];
        pulse.radius += 0.8;
        pulse.opacity -= 0.0003;
        if (pulse.opacity <= 0) {
          pulseRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(210, 48, 48, ${pulse.opacity})`;
        ctx.lineWidth = 1;
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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleNetwork;
