import { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { cn } from "@/lib/utils";
import {
  MAX_IMPOSTOR_COUNT,
  MAX_PLAYER_COUNT,
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
  const maxSelectable = Math.min(
    MAX_IMPOSTOR_COUNT,
    Math.max(1, activePlayerCount - 1),
  );

  const adventurerCount = Math.max(0, activePlayerCount - impostorCount);
  const impostorRatio =
    activePlayerCount > 0 ? impostorCount / activePlayerCount : 0;

  const barRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    void getGsap().then((gsap) => {
      if (barRef.current) {
        gsap.to(barRef.current, {
          scaleX: impostorRatio,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current,
          { opacity: 0.3, y: -4 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        );
      }
    });
  }, [impostorCount, impostorRatio]);

  const dangerLevel =
    impostorCount === 1 ? 0 : impostorCount === 2 ? 0.4 : 0.8;

  return (
    <div className="lobby-section relative overflow-hidden">
      {/* Danger ambient */}
      {dangerLevel > 0 && (
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, rgba(224,64,64,${dangerLevel * 0.12}), transparent 70%)`,
          }}
          aria-hidden
        />
      )}

      <div className="relative z-10 space-y-4 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.15em] text-foreground/80">
              Configuration
            </h3>
            <span
              className="font-mono text-[10px] font-semibold tabular-nums"
              style={{
                color:
                  activePlayerCount >= MAX_PLAYER_COUNT
                    ? "#ff6b6b"
                    : "rgba(255,255,255,0.35)",
              }}
            >
              {activePlayerCount}/{MAX_PLAYER_COUNT}
            </span>
          </div>

          {/* Role ratio pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <SkullIcon
                className={cn(
                  "h-3.5 w-3.5 transition-colors duration-300",
                  impostorCount > 1 ? "text-[#ff6b6b]" : "text-[#e04040]",
                )}
                aria-hidden
              />
              <span className="font-mono text-sm font-black tabular-nums text-foreground">
                {impostorCount}
              </span>
            </div>
            <span
              className="text-[10px] text-foreground/30"
              aria-hidden="true"
            >
              /
            </span>
            <div className="flex items-center gap-1">
              <SwordIcon className="h-3.5 w-3.5 text-[#f5d060]" aria-hidden />
              <span className="font-mono text-sm font-black tabular-nums text-foreground">
                {adventurerCount}
              </span>
            </div>
          </div>
        </div>

        {/* Ratio bar */}
        <div className="space-y-2">
          <div
            className="relative h-1.5 w-full overflow-hidden"
            style={{ background: "rgba(212, 160, 23, 0.12)" }}
          >
            <div
              ref={barRef}
              className="h-full"
              style={{
                width: "100%",
                transformOrigin: "left",
                transform: `scaleX(${impostorRatio})`,
                background:
                  "linear-gradient(90deg, #c03030, #e04040, #ff6b6b)",
                boxShadow: "0 0 10px rgba(224, 64, 64, 0.35)",
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.12em]">
            <span className="flex items-center gap-1 text-[#e04040]/70">
              <span
                className="h-1.5 w-1.5"
                style={{
                  background: "#e04040",
                  boxShadow: "0 0 4px rgba(224,64,64,0.4)",
                }}
                aria-hidden
              />
              Imposteurs
            </span>
            <span className="flex items-center gap-1 text-[#d4a017]/70">
              Aventuriers
              <span
                className="h-1.5 w-1.5"
                style={{
                  background: "#d4a017",
                  boxShadow: "0 0 4px rgba(212,160,23,0.4)",
                }}
                aria-hidden
              />
            </span>
          </div>
        </div>

        {/* Info line */}
        <p
          ref={infoRef}
          className="text-center text-xs leading-relaxed text-foreground/60"
        >
          Minimum{" "}
          <span className="font-semibold text-foreground/80">
            {minPlayers} joueurs
          </span>{" "}
          pour{" "}
          <span
            className={cn(
              "font-bold",
              impostorCount > 1 ? "text-[#ff6b6b]" : "text-emerald/80",
            )}
          >
            {impostorCount} imposteur{impostorCount > 1 ? "s" : ""}
          </span>
        </p>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(80,200,120,0.1), transparent)",
          }}
        />

        {/* Stepper / Display */}
        {isHost ? (
          <div className="space-y-2.5">
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
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
                        "relative flex h-12 flex-1 cursor-pointer items-center justify-center font-mono text-lg font-black tabular-nums transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "text-emerald"
                          : "text-foreground/60 hover:text-foreground/80",
                        disabled && !active && "pointer-events-none opacity-20",
                      )}
                      style={{
                        background: active
                          ? "rgba(80, 200, 120, 0.08)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: active
                          ? "1px solid rgba(80, 200, 120, 0.3)"
                          : "1px solid rgba(255, 255, 255, 0.05)",
                        boxShadow: active
                          ? "0 0 16px rgba(80,200,120,0.1), inset 0 1px 0 rgba(80,200,120,0.06)"
                          : "none",
                      }}
                    >
                      {n}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="font-display text-2xl font-bold tabular-nums text-emerald">
              {impostorCount}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground/80">
                imposteur{impostorCount > 1 ? "s" : ""}
              </span>
              <span className="text-[11px] text-foreground/50">
                défini par l&apos;hôte
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
