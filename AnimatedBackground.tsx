import { useEffect, useRef } from 'react';

// Multi-layer animated background: gradient mesh, floating financial particles,
// network nodes, grid overlay, and subtle parallax on mouse move.
const SYMBOLS = ['Σ', 'β', 'α', 'Δ', 'π', 'σ', 'ρ', 'λ', 'μ', '∂', '∫', '√'];
const CHART_FRAGMENTS = ['📈', '▮', '⌁', '◇', '◯'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  opacity: number;
  rot: number;
  vrot: number;
  type: 'symbol' | 'dot' | 'node';
  pulse: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particleCount = Math.min(70, Math.floor((w * h) / 22000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const type: Particle['type'] = i % 5 === 0 ? 'node' : i % 3 === 0 ? 'symbol' : 'dot';
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        symbol:
          type === 'symbol'
            ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            : type === 'node'
              ? CHART_FRAGMENTS[Math.floor(Math.random() * CHART_FRAGMENTS.length)]
              : '·',
        size: type === 'symbol' ? 12 + Math.random() * 8 : type === 'node' ? 3 + Math.random() * 3 : 1.5 + Math.random() * 2,
        opacity: 0.08 + Math.random() * 0.22,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.005,
        type,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX / w - 0.5) * 2;
      mouseRef.current.ty = (e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    let t = 0;
    const draw = () => {
      t += 0.005;
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.05;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // mesh gradient blobs
      const blobs = [
        { x: w * 0.2 + Math.sin(t * 0.7) * 80, y: h * 0.3 + Math.cos(t * 0.5) * 60, r: 380, c: 'rgba(14,159,110,0.06)' },
        { x: w * 0.8 + Math.cos(t * 0.6) * 100, y: h * 0.7 + Math.sin(t * 0.8) * 70, r: 420, c: 'rgba(5,150,105,0.05)' },
        { x: w * 0.5 + Math.sin(t * 0.4) * 120, y: h * 0.5 + Math.cos(t * 0.3) * 80, r: 300, c: 'rgba(16,185,129,0.04)' },
      ];
      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // grid overlay
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const offX = (mx * 20) % gridSize;
      const offY = (my * 20) % gridSize;
      for (let x = -gridSize + offX; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -gridSize + offY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // particles
      for (const p of particles) {
        p.x += p.vx + mx * 0.3;
        p.y += p.vy + my * 0.2;
        p.rot += p.vrot;
        p.pulse += 0.02;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const pulseOp = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        if (p.type === 'symbol') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = `${p.size}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = `rgba(110,231,183,${pulseOp})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.symbol, 0, 0);
          ctx.restore();
        } else if (p.type === 'node') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(52,211,153,${pulseOp * 1.2})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(52,211,153,${pulseOp * 0.3})`;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(148,163,184,${pulseOp})`;
          ctx.fill();
        }
      }

      // network connections between nearby nodes
      ctx.strokeStyle = 'rgba(14,159,110,0.08)';
      ctx.lineWidth = 0.5;
      const nodes = particles.filter((p) => p.type === 'node');
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) {
            ctx.globalAlpha = (1 - d / 200) * 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink-base">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
