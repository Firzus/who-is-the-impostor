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
