import { useState, useCallback, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "who-impostor-streamer-mode";

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setStreamerMode(value: boolean) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { }
  emitChange();
}

export function useStreamerMode() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    setStreamerMode(!getSnapshot());
  }, []);

  const [revealed, setRevealed] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealTemporarily = useCallback((durationMs = 3000) => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setRevealed(true);
    revealTimerRef.current = setTimeout(() => {
      setRevealed(false);
      revealTimerRef.current = null;
    }, durationMs);
  }, []);

  const hideImmediately = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setRevealed(false);
  }, []);

  return {
    enabled,
    toggle,
    revealed,
    revealTemporarily,
    hideImmediately,
    isCodeHidden: enabled && !revealed,
  };
}

export function maskCode(code: string): string {
  return "•".repeat(code.length);
}

export function maskUrl(url: string): string {
  return url.replace(/\/lobby\/[A-Z0-9]+/i, "/lobby/••••••");
}
