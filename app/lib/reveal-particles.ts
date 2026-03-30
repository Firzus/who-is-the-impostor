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
  shape: "dot" | "ember" | "spark" | "shard" | "flare";
  life: number;
  maxLife: number;
}

interface Shockwave {
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
  lineWidth: number;
  color: string;
}

interface ParticleConfig {
  colors: string[];
  glowColor: string;
  gravity: number;
  burstSpeed: number;
  rayCount: number;
}

const ROLE_CONFIGS: Record<string, ParticleConfig> = {
  imposteur: {
    colors: [
      "#FF4040", "#E02020", "#FF5030", "#CC1818",
      "#FF6B4A", "#A01010", "#FF3050", "#800808",
    ],
    glowColor: "#E04040",
    gravity: 0.05,
    burstSpeed: 16,
    rayCount: 10,
  },
  aventurier: {
    colors: [
      "#FFD700", "#FFC040", "#FFEA80", "#E8A010",
      "#50C878", "#78E898", "#F5D060", "#D4A017",
    ],
    glowColor: "#D4A017",
    gravity: 0.025,
    burstSpeed: 14,
    rayCount: 12,
  },
};

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function hexRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function pickColor(colors: string[], maxIndex?: number): string {
  const n = maxIndex ?? colors.length;
  return colors[Math.floor(Math.random() * n)];
}

// ─── Glow sprite cache ──────────────────────────────────────────

const glowCache = new Map<string, HTMLCanvasElement>();

function getGlowSprite(color: string, radius: number): HTMLCanvasElement {
  const key = `${color}_${radius}`;
  let cached = glowCache.get(key);
  if (cached) return cached;

  cached = document.createElement("canvas");
  const size = radius * 2;
  cached.width = size;
  cached.height = size;
  const gCtx = cached.getContext("2d")!;
  const g = gCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  gCtx.fillStyle = g;
  gCtx.fillRect(0, 0, size, size);
  glowCache.set(key, cached);
  return cached;
}

function getGlowRadius(p: Particle): number {
  switch (p.shape) {
    case "dot": return Math.min(p.size * 6, 25);
    case "ember": return Math.min(p.size * 5, 20);
    case "spark": return Math.min(p.size * 8, 25);
    case "shard": return Math.min(p.size * 5, 20);
    case "flare": return Math.min(p.size * 10, 50);
  }
}

// ─── Particle factories ─────────────────────────────────────────

function createBurst(cx: number, cy: number, cfg: ParticleConfig): Particle {
  const a = Math.random() * Math.PI * 2;
  const spd = rand(4, cfg.burstSpeed);
  const shapes: Particle["shape"][] = ["dot", "shard", "spark"];
  return {
    x: cx + rand(-8, 8), y: cy + rand(-8, 8),
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
    size: rand(2, 6), opacity: 1, decay: rand(0.012, 0.022),
    color: pickColor(cfg.colors),
    rotation: Math.random() * 360, rotationSpeed: rand(-8, 8),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    life: 0, maxLife: rand(30, 60),
  };
}

function createEmber(cx: number, cy: number, cfg: ParticleConfig): Particle {
  return {
    x: cx + rand(-35, 35), y: cy + rand(-15, 15),
    vx: rand(-1.5, 1.5), vy: rand(-3.5, -0.8),
    size: rand(1.5, 4), opacity: rand(0.7, 1), decay: rand(0.005, 0.011),
    color: pickColor(cfg.colors, 4),
    rotation: Math.random() * 360, rotationSpeed: rand(-3, 3),
    shape: "ember", life: 0, maxLife: rand(55, 110),
  };
}

function createSpark(cx: number, cy: number, cfg: ParticleConfig): Particle {
  const a = Math.random() * Math.PI * 2;
  const spd = rand(10, 24);
  return {
    x: cx, y: cy,
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
    size: rand(1, 2.5), opacity: 1, decay: rand(0.028, 0.05),
    color: pickColor(cfg.colors, 3),
    rotation: 0, rotationSpeed: 0,
    shape: "dot", life: 0, maxLife: rand(12, 28),
  };
}

function createFlare(cx: number, cy: number, cfg: ParticleConfig): Particle {
  const a = Math.random() * Math.PI * 2;
  const spd = rand(0.3, 1.8);
  return {
    x: cx + rand(-5, 5), y: cy + rand(-5, 5),
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 0.4,
    size: rand(10, 18), opacity: rand(0.35, 0.6), decay: rand(0.005, 0.009),
    color: cfg.colors[0],
    rotation: 0, rotationSpeed: 0,
    shape: "flare", life: 0, maxLife: rand(40, 70),
  };
}

// ─── Draw helpers ────────────────────────────────────────────────

let currentDpr = 1;

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const fadeIn = Math.min(p.life / 3, 1);
  const fadeOut = Math.max(1 - p.life / p.maxLife, 0);
  const alpha = p.opacity * fadeIn * fadeOut;
  if (alpha < 0.01) return;

  // Draw glow sprite (replaces shadowBlur)
  const glowRadius = getGlowRadius(p);
  if (glowRadius > 0) {
    ctx.globalAlpha = alpha * (p.shape === "flare" ? 0.5 : 0.7);
    const sprite = getGlowSprite(p.color, Math.ceil(glowRadius));
    ctx.drawImage(sprite, p.x - glowRadius, p.y - glowRadius, glowRadius * 2, glowRadius * 2);
  }

  ctx.globalAlpha = alpha;
  ctx.setTransform(currentDpr, 0, 0, currentDpr, p.x * currentDpr, p.y * currentDpr);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.fillStyle = p.color;

  switch (p.shape) {
    case "dot":
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "ember":
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.45, p.size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "spark": {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 2);
      ctx.lineTo(s * 0.15, -s * 0.15);
      ctx.lineTo(s * 2, 0);
      ctx.lineTo(s * 0.15, s * 0.15);
      ctx.lineTo(0, s * 2);
      ctx.lineTo(-s * 0.15, s * 0.15);
      ctx.lineTo(-s * 2, 0);
      ctx.lineTo(-s * 0.15, -s * 0.15);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "shard":
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.4);
      ctx.lineTo(p.size * 0.35, 0);
      ctx.lineTo(0, p.size * 1.4);
      ctx.lineTo(-p.size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      break;

    case "flare":
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
}

function drawShockwave(
  ctx: CanvasRenderingContext2D,
  sw: Shockwave,
  cx: number,
  cy: number,
) {
  const progress = sw.radius / sw.maxRadius;
  const alpha = (1 - progress) * sw.opacity;
  if (alpha < 0.01) return;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = sw.color;
  ctx.lineWidth = sw.lineWidth * (1 - progress * 0.6) + 2;
  ctx.beginPath();
  ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGodRays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frame: number,
  cfg: ParticleConfig,
  reach: number,
) {
  const fadeIn = Math.min(Math.max(frame - 4, 0) / 10, 1);
  const fadeOut = Math.max(1 - Math.max(frame - 50, 0) / 50, 0);
  const base = fadeIn * fadeOut * 0.18;
  if (base < 0.005) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.004);

  // Create gradient ONCE per frame (shared by all rays)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
  g.addColorStop(0, hexRgba(cfg.glowColor, base));
  g.addColorStop(0.35, hexRgba(cfg.glowColor, base * 0.35));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;

  for (let i = 0; i < cfg.rayCount; i++) {
    const angle = (i / cfg.rayCount) * Math.PI * 2;
    const width = 0.1 + Math.sin(frame * 0.04 + i * 1.3) * 0.025;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, reach, angle - width / 2, angle + width / 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawFlash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frame: number,
  cfg: ParticleConfig,
  maxR: number,
) {
  if (frame > 18) return;
  const t = frame / 18;
  const alpha = (1 - t) * 0.55;
  const r = maxR * (0.25 + t * 0.75);

  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, hexRgba(cfg.glowColor, alpha));
  g.addColorStop(0.5, hexRgba(cfg.glowColor, alpha * 0.25));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Main ────────────────────────────────────────────────────────

export function burstParticles(
  canvas: HTMLCanvasElement,
  role: string,
): () => void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return () => {};

  const cfg = ROLE_CONFIGS[role] ?? ROLE_CONFIGS.aventurier;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = window.devicePixelRatio || 1;
  currentDpr = dpr;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const maxDim = Math.max(rect.width, rect.height);

  const particles: Particle[] = [];
  const shockwaves: Shockwave[] = [];
  let cancelled = false;
  let animId: number;
  let frame = 0;

  // Initial burst
  for (let i = 0; i < 50; i++) particles.push(createBurst(cx, cy, cfg));
  for (let i = 0; i < 6; i++) particles.push(createFlare(cx, cy, cfg));
  shockwaves.push({
    radius: 0, maxRadius: maxDim * 0.35, speed: 4.5,
    opacity: 0.8, lineWidth: 3, color: cfg.glowColor,
  });

  // Staggered waves
  const waves: { at: number; run: () => void }[] = [
    {
      at: 3,
      run: () => {
        shockwaves.push({
          radius: 0, maxRadius: maxDim * 0.25, speed: 6.5,
          opacity: 0.5, lineWidth: 2, color: cfg.glowColor,
        });
      },
    },
    {
      at: 6,
      run: () => {
        for (let i = 0; i < 30; i++) particles.push(createEmber(cx, cy, cfg));
        for (let i = 0; i < 20; i++) particles.push(createSpark(cx, cy, cfg));
      },
    },
    {
      at: 15,
      run: () => {
        for (let i = 0; i < 20; i++) particles.push(createEmber(cx, cy, cfg));
        for (let i = 0; i < 15; i++) particles.push(createSpark(cx, cy, cfg));
      },
    },
    {
      at: 25,
      run: () => {
        shockwaves.push({
          radius: 0, maxRadius: maxDim * 0.5, speed: 3,
          opacity: 0.3, lineWidth: 1.5, color: cfg.glowColor,
        });
        for (let i = 0; i < 12; i++) particles.push(createEmber(cx, cy, cfg));
      },
    },
    {
      at: 40,
      run: () => {
        for (let i = 0; i < 8; i++) particles.push(createEmber(cx, cy, cfg));
      },
    },
  ];

  function tick() {
    if (cancelled) return;
    frame++;
    ctx!.clearRect(0, 0, rect.width, rect.height);
    ctx!.globalCompositeOperation = "lighter";

    for (const w of waves) {
      if (frame === w.at) w.run();
    }

    // Layer 1 – central flash
    drawFlash(ctx!, cx, cy, frame, cfg, maxDim * 0.4);

    // Layer 2 – god rays
    drawGodRays(ctx!, cx, cy, frame, cfg, maxDim * 0.55);

    // Layer 3 – shockwaves (swap-and-pop removal)
    for (let i = 0; i < shockwaves.length; i++) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      drawShockwave(ctx!, sw, cx, cy);
      if (sw.radius >= sw.maxRadius) {
        shockwaves[i] = shockwaves[shockwaves.length - 1];
        shockwaves.length--;
        i--;
      }
    }

    // Layer 4 – particles (swap-and-pop removal)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.shape === "ember") {
        p.vy -= 0.012;
        p.vx += rand(-0.08, 0.08);
        p.vx *= 0.995;
        p.vy *= 0.995;
      } else if (p.shape === "flare") {
        p.vy -= 0.005;
        p.vx *= 0.98;
        p.vy *= 0.98;
      } else {
        p.vy += cfg.gravity;
        p.vx *= 0.985;
        p.vy *= 0.985;
      }

      p.opacity -= p.decay;
      p.rotation += p.rotationSpeed;
      p.size *= 0.997;
      p.life++;

      if (p.opacity <= 0 || p.life > p.maxLife) {
        particles[i] = particles[particles.length - 1];
        particles.length--;
        i--;
        continue;
      }

      drawParticle(ctx!, p);
    }

    if (particles.length > 0 || shockwaves.length > 0 || frame < 100) {
      animId = requestAnimationFrame(tick);
    }
  }

  animId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(animId);
  };
}
