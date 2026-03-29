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
  shape: "circle" | "diamond" | "spark" | "rune" | "ring" | "streak";
  life: number;
  maxLife: number;
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
      "rgba(244, 63, 94, 1)",
      "rgba(251, 113, 133, 1)",
      "rgba(225, 29, 72, 1)",
      "rgba(255, 80, 100, 0.9)",
      "rgba(255, 160, 140, 0.8)",
      "rgba(190, 20, 50, 0.7)",
    ],
    count: 140,
    spread: 12,
    gravity: 0.04,
  },
  aventurier: {
    colors: [
      "rgba(52, 211, 153, 1)",
      "rgba(110, 231, 183, 1)",
      "rgba(16, 185, 129, 1)",
      "rgba(52, 255, 180, 0.9)",
      "rgba(180, 255, 220, 0.8)",
      "rgba(6, 150, 100, 0.7)",
    ],
    count: 140,
    spread: 12,
    gravity: 0.04,
  },
};

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createParticle(
  cx: number,
  cy: number,
  config: ParticleConfig,
  wave: number
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(2, config.spread) * (1 + wave * 0.3);
  const shapes: Particle["shape"][] = ["circle", "diamond", "spark", "rune", "ring", "streak"];
  const maxLife = randomBetween(40, 90);

  return {
    x: cx + randomBetween(-15, 15),
    y: cy + randomBetween(-20, 20),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - randomBetween(1.5, 4),
    size: randomBetween(2, 8),
    opacity: randomBetween(0.8, 1),
    decay: randomBetween(0.008, 0.018),
    color: config.colors[Math.floor(Math.random() * config.colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: randomBetween(-6, 6),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    life: 0,
    maxLife,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  const fadeIn = Math.min(p.life / 5, 1);
  const fadeOut = Math.max(1 - p.life / p.maxLife, 0);
  ctx.globalAlpha = p.opacity * fadeIn * fadeOut;
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);

  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = p.size * 4;

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
      ctx.moveTo(0, -p.size * 1.8);
      ctx.lineTo(p.size * 0.2, -p.size * 0.2);
      ctx.lineTo(p.size * 1.8, 0);
      ctx.lineTo(p.size * 0.2, p.size * 0.2);
      ctx.lineTo(0, p.size * 1.8);
      ctx.lineTo(-p.size * 0.2, p.size * 0.2);
      ctx.lineTo(-p.size * 1.8, 0);
      ctx.lineTo(-p.size * 0.2, -p.size * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    case "rune":
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.5, 0);
      ctx.lineTo(p.size * 0.5, 0);
      ctx.moveTo(0, -p.size * 0.5);
      ctx.lineTo(0, p.size * 0.5);
      ctx.stroke();
      break;
    case "ring":
      ctx.lineWidth = 1;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "streak": {
      const len = p.size * 3;
      const grad = ctx.createLinearGradient(0, -len / 2, 0, len / 2);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, p.color);
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.size * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, -len / 2);
      ctx.lineTo(0, len / 2);
      ctx.stroke();
      break;
    }
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
  let cancelled = false;
  let animId: number;
  let frame = 0;

  for (let i = 0; i < config.count; i++) {
    particles.push(createParticle(cx, cy, config, 0));
  }

  const burstWaves = [
    { delay: 8, count: 40 },
    { delay: 18, count: 30 },
    { delay: 30, count: 20 },
  ];

  function tick() {
    if (cancelled) return;
    frame++;
    ctx!.clearRect(0, 0, rect.width, rect.height);

    for (const wave of burstWaves) {
      if (frame === wave.delay) {
        for (let i = 0; i < wave.count; i++) {
          particles.push(createParticle(cx, cy, config, burstWaves.indexOf(wave) + 1));
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += config.gravity;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.opacity -= p.decay;
      p.rotation += p.rotationSpeed;
      p.size *= 0.998;
      p.life++;

      if (p.opacity <= 0 || p.life > p.maxLife) {
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
