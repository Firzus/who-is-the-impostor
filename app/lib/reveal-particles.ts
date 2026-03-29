interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  decay: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "diamond" | "spark";
}

interface ParticleConfig {
  colors: string[];
  count: number;
  spread: number;
  gravity: number;
}

const ROLE_CONFIGS: Record<string, ParticleConfig> = {
  imposteur: {
    colors: [
      "rgba(224, 64, 64, 1)",
      "rgba(255, 100, 80, 1)",
      "rgba(180, 40, 40, 1)",
      "rgba(255, 60, 60, 0.8)",
      "rgba(255, 140, 100, 0.9)",
    ],
    count: 60,
    spread: 7,
    gravity: 0.06,
  },
  aventurier: {
    colors: [
      "rgba(74, 186, 106, 1)",
      "rgba(100, 220, 140, 1)",
      "rgba(50, 160, 80, 1)",
      "rgba(120, 255, 160, 0.8)",
      "rgba(80, 200, 120, 0.9)",
    ],
    count: 60,
    spread: 7,
    gravity: 0.06,
  },
};

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createParticle(
  cx: number,
  cy: number,
  config: ParticleConfig
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(1.5, config.spread);
  const shapes: Particle["shape"][] = ["circle", "diamond", "spark"];

  return {
    x: cx + randomBetween(-20, 20),
    y: cy + randomBetween(-30, 30),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - randomBetween(1, 3),
    size: randomBetween(2, 6),
    opacity: randomBetween(0.7, 1),
    decay: randomBetween(0.012, 0.025),
    color: config.colors[Math.floor(Math.random() * config.colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: randomBetween(-5, 5),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);

  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = p.size * 2;

  switch (p.shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "diamond":
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.6, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case "spark":
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.5);
      ctx.lineTo(p.size * 0.3, -p.size * 0.3);
      ctx.lineTo(p.size * 1.5, 0);
      ctx.lineTo(p.size * 0.3, p.size * 0.3);
      ctx.lineTo(0, p.size * 1.5);
      ctx.lineTo(-p.size * 0.3, p.size * 0.3);
      ctx.lineTo(-p.size * 1.5, 0);
      ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.restore();
}

export function burstParticles(
  canvas: HTMLCanvasElement,
  role: string
): () => void {
  const config = ROLE_CONFIGS[role] ?? ROLE_CONFIGS.aventurier;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => { };

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const particles: Particle[] = [];
  for (let i = 0; i < config.count; i++) {
    particles.push(createParticle(cx, cy, config));
  }

  let animId: number;
  let cancelled = false;

  function tick() {
    if (cancelled) return;
    ctx!.clearRect(0, 0, rect.width, rect.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += config.gravity;
      p.vx *= 0.99;
      p.opacity -= p.decay;
      p.rotation += p.rotationSpeed;
      p.size *= 0.997;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      drawParticle(ctx!, p);
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(tick);
    }
  }

  animId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(animId);
  };
}
