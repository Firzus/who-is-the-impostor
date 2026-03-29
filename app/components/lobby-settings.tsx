import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { cn } from "@/lib/utils";
import {
  MAX_IMPOSTOR_COUNT,
  minPlayersForLobby,
} from "@/lib/lobby-lifecycle";

interface LobbySettingsProps {
  impostorCount: number;
  activePlayerCount: number;
  isHost: boolean;
  updating?: boolean;
  onImpostorCountChange: (count: number) => void | Promise<void>;
}

export function LobbySettings({
  impostorCount,
  activePlayerCount,
  isHost,
  updating,
  onImpostorCountChange,
}: LobbySettingsProps) {
  const minPlayers = minPlayersForLobby(impostorCount);
  const maxSelectable = Math.min(MAX_IMPOSTOR_COUNT, Math.max(1, activePlayerCount - 1));

  const adventurerCount = Math.max(0, activePlayerCount - impostorCount);
  const impostorRatio = activePlayerCount > 0 ? impostorCount / activePlayerCount : 0;

  const barRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${impostorRatio * 100}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    }
    if (infoRef.current) {
      gsap.fromTo(
        infoRef.current,
        { opacity: 0.3, y: -6 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [impostorCount, impostorRatio]);

  const dangerLevel = impostorCount === 1 ? 0 : impostorCount === 2 ? 0.4 : 0.8;

  return (
    <div
      className="config-panel relative overflow-hidden transition-all duration-500"
      style={{
        background: "rgba(10, 14, 20, 0.85)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        border: `1px solid rgba(80, 200, 120, ${0.12 + dangerLevel * 0.08})`,
        boxShadow: dangerLevel > 0
          ? `inset 0 1px 0 rgba(224, 64, 64, ${dangerLevel * 0.06}), 0 0 40px rgba(224, 64, 64, ${dangerLevel * 0.06}), 0 0 0 1px rgba(0,0,0,0.5)`
          : "inset 0 1px 0 rgba(80, 200, 120, 0.06), 0 0 40px rgba(80, 200, 120, 0.06), 0 0 0 1px rgba(0,0,0,0.5)",
      }}
    >
      {/* Decorative corner accents */}
      <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t border-l border-[#50C878]/30" aria-hidden />
      <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t border-r border-[#50C878]/30" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-[#50C878]/30" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[#50C878]/30" aria-hidden />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: dangerLevel > 0
            ? `radial-gradient(circle, rgba(224,64,64,${dangerLevel * 0.15}), transparent 70%)`
            : "radial-gradient(circle, rgba(80,200,120,0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 p-5 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-foreground">
              Configuration
            </h3>
            <p
              ref={infoRef}
              className="text-[13px] leading-relaxed text-foreground/70"
            >
              Minimum{" "}
              <span className="font-semibold text-foreground/90">{minPlayers} joueurs</span>
              {" "}pour lancer avec{" "}
              <span className={cn(
                "font-bold",
                impostorCount > 1 ? "text-[#ff6b6b]" : "text-[#6be8a0]"
              )}>
                {impostorCount} imposteur{impostorCount > 1 ? "s" : ""}
              </span>
            </p>
          </div>

          {/* Role counters */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <SkullIcon
              className={cn(
                "h-5 w-5 transition-colors duration-300",
                impostorCount > 1 ? "text-[#ff6b6b]" : "text-[#e04040]"
              )}
              aria-hidden
            />
            <span className="font-mono text-xl font-black tabular-nums text-foreground">
              {impostorCount}
            </span>
            <span className="text-foreground/30 mx-0.5 text-sm">/</span>
            <SwordIcon className="h-5 w-5 text-[#f5d060]" aria-hidden />
            <span className="font-mono text-xl font-black tabular-nums text-foreground">
              {adventurerCount}
            </span>
          </div>
        </div>

        {/* Ratio bar */}
        <div className="space-y-2.5">
          <div
            className="relative h-2.5 w-full overflow-hidden"
            style={{ background: "rgba(212, 160, 23, 0.15)" }}
          >
            <div
              ref={barRef}
              className="h-full"
              style={{
                width: `${impostorRatio * 100}%`,
                background: "linear-gradient(90deg, #c03030, #e04040, #ff6b6b)",
                boxShadow: "0 0 12px rgba(224, 64, 64, 0.4)",
              }}
            />
            {/* Tick marks */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: activePlayerCount > 1 ? activePlayerCount - 1 : 0 }, (_, i) => (
                <div
                  key={i}
                  className="h-full border-r border-black/30"
                  style={{ width: `${100 / activePlayerCount}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
            <span className="flex items-center gap-1.5 text-[#e04040]">
              <span
                className="h-2 w-2"
                style={{ background: "#e04040", boxShadow: "0 0 6px rgba(224,64,64,0.5)" }}
                aria-hidden
              />
              Imposteurs
            </span>
            <span className="flex items-center gap-1.5 text-[#d4a017]">
              Aventuriers
              <span
                className="h-2 w-2"
                style={{ background: "#d4a017", boxShadow: "0 0 6px rgba(212,160,23,0.5)" }}
                aria-hidden
              />
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(80,200,120,0.15), transparent)" }} />

        {/* Stepper / Display */}
        {isHost ? (
          <div className="space-y-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
              Nombre d&apos;imposteurs
            </p>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Nombre d'imposteurs"
            >
              {Array.from({ length: MAX_IMPOSTOR_COUNT }, (_, i) => i + 1).map(
                (n) => {
                  const disabled = updating || n > maxSelectable;
                  const active = impostorCount === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={disabled}
                      onClick={() => void onImpostorCountChange(n)}
                      className={cn(
                        "relative flex h-14 flex-1 items-center justify-center font-mono text-xl font-black tabular-nums transition-all duration-300 cursor-pointer",
                        active
                          ? "text-[#50C878]"
                          : "text-foreground/40 hover:text-foreground/70",
                        disabled && !active && "pointer-events-none opacity-20"
                      )}
                      style={{
                        background: active
                          ? "rgba(80, 200, 120, 0.1)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: active
                          ? "1px solid rgba(80, 200, 120, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.06)",
                        boxShadow: active
                          ? "0 0 20px rgba(80,200,120,0.12), inset 0 1px 0 rgba(80,200,120,0.08)"
                          : "none",
                      }}
                    >
                      {active && (
                        <span
                          className="absolute inset-0 animate-pulse"
                          style={{ border: "1px solid rgba(80, 200, 120, 0.15)" }}
                          aria-hidden
                        />
                      )}
                      {n}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-4 px-4 py-3.5"
            style={{
              background: "rgba(80, 200, 120, 0.04)",
              border: "1px solid rgba(80, 200, 120, 0.12)",
            }}
          >
            <span className="font-display text-3xl font-bold tabular-nums text-[#50C878]">
              {impostorCount}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground/80">
                imposteur{impostorCount > 1 ? "s" : ""}
              </span>
              <span className="text-xs text-foreground/50">
                défini par l&apos;hôte
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
