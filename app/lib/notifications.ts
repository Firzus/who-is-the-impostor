const AUDIO_CONTEXT_KEY = "who-impostor-audio-ctx";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playJoinSound() {
  playTone(880, 0.15, "sine");
  setTimeout(() => playTone(1100, 0.12, "sine"), 80);
}

export function playLeaveSound() {
  playTone(440, 0.2, "sine");
  setTimeout(() => playTone(330, 0.25, "sine"), 100);
}

export function playRolesAssignedSound() {
  playTone(660, 0.15, "triangle");
  setTimeout(() => playTone(880, 0.15, "triangle"), 120);
  setTimeout(() => playTone(1100, 0.2, "triangle"), 240);
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, sr * duration, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

export function playRevealSound(role: string) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  const imp = role === "imposteur";

  // Layer 1: Sub-bass impact
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = "sine";
  bass.frequency.setValueAtTime(imp ? 70 : 100, now);
  bass.frequency.exponentialRampToValueAtTime(imp ? 30 : 55, now + 0.35);
  bassGain.gain.setValueAtTime(0.15, now);
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  bass.connect(bassGain).connect(ctx.destination);
  bass.start(now);
  bass.stop(now + 0.4);

  // Layer 2: Filtered noise whoosh
  const noiseBuf = createNoiseBuffer(ctx, 0.6);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(imp ? 150 : 300, now);
  bandpass.frequency.exponentialRampToValueAtTime(imp ? 800 : 2500, now + 0.35);
  bandpass.Q.value = 1.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.6);

  // Layer 3: High-frequency accent
  const accent = ctx.createOscillator();
  const accentGain = ctx.createGain();
  accent.type = imp ? "triangle" : "sine";
  accent.frequency.setValueAtTime(imp ? 1200 : 3000, now + 0.05);
  accent.frequency.exponentialRampToValueAtTime(imp ? 600 : 5000, now + 0.3);
  accentGain.gain.setValueAtTime(0, now);
  accentGain.gain.linearRampToValueAtTime(imp ? 0.06 : 0.04, now + 0.08);
  accentGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + (imp ? 0.35 : 0.6),
  );
  accent.connect(accentGain).connect(ctx.destination);
  accent.start(now + 0.05);
  accent.stop(now + (imp ? 0.4 : 0.65));

  // Aventurier: extra chime for heroic feel
  if (!imp) {
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(1760, now + 0.12);
    chimeGain.gain.setValueAtTime(0, now + 0.12);
    chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.15);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    chime.connect(chimeGain).connect(ctx.destination);
    chime.start(now + 0.12);
    chime.stop(now + 0.45);
  }
}

export function requestNotificationPermission() {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string) {
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted" &&
    document.hidden
  ) {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}
