const SOUNDS = {
  "reveal-impostor": "/sfx/reveal-impostor.mp3",
  "reveal-aventurier": "/sfx/reveal-aventurier.mp3",
  "roles-assigned": "/sfx/roles-assigned.mp3",
  "player-join": "/sfx/player-join.mp3",
  "player-leave": "/sfx/player-leave.mp3",
} as const;

type SoundId = keyof typeof SOUNDS;

let audioCtx: AudioContext | null = null;
const bufferCache = new Map<SoundId, AudioBuffer>();
let preloadPromise: Promise<void> | null = null;
let unlocked = false;

function unlockAudio() {
  if (unlocked) return;
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  unlocked = true;
}

function ensureUnlockListeners() {
  if (typeof document === "undefined" || unlocked) return;

  const events = ["click", "touchend", "keydown"] as const;
  const handler = () => {
    unlockAudio();
    events.forEach((e) => document.removeEventListener(e, handler));
  };
  events.forEach((e) =>
    document.addEventListener(e, handler, { once: true }),
  );
}

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export async function preloadSounds(): Promise<void> {
  ensureUnlockListeners();
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    const ctx = getCtx();
    if (!ctx) return;

    const entries = Object.entries(SOUNDS) as [SoundId, string][];

    await Promise.allSettled(
      entries.map(async ([id, url]) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        bufferCache.set(id, audio);
      }),
    );
  })();

  return preloadPromise;
}

function playBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  volume: number,
): void {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start(0);
}

export function playSound(
  id: SoundId,
  opts?: { volume?: number },
): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const buffer = bufferCache.get(id);
  if (buffer) {
    playBuffer(ctx, buffer, opts?.volume ?? 0.25);
  }
}

export function playJoinSound() {
  playSound("player-join");
}

export function playLeaveSound() {
  playSound("player-leave");
}

export function playRolesAssignedSound() {
  playSound("roles-assigned");
}

export function playRevealSound(role: string) {
  const id: SoundId =
    role === "imposteur" ? "reveal-impostor" : "reveal-aventurier";
  playSound(id);
}
