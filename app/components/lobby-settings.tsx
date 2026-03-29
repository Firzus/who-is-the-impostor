import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkullIcon } from "@/components/icons/skull-icon";
import { Settings2 } from "lucide-react";
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

  return (
    <Card className="border-border/50 bg-card/20 shadow-[0_0_40px_-12px_rgba(80,200,120,0.12)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#50C878]/20 bg-[#50C878]/5 text-[#50C878]">
            <Settings2 className="h-4 w-4" aria-hidden />
          </span>
          Configuration de la partie
        </CardTitle>
        <p className="text-xs text-muted-foreground/80">
          Minimum {minPlayers} joueurs pour lancer avec {impostorCount}{" "}
          imposteur{impostorCount > 1 ? "s" : ""}.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            <SkullIcon className="h-3.5 w-3.5 text-[#50C878]/70" aria-hidden />
            Nombre d&apos;imposteurs
          </p>
          {isHost ? (
            <div
              className="flex gap-2"
              role="group"
              aria-label="Nombre d'imposteurs"
            >
              {Array.from({ length: MAX_IMPOSTOR_COUNT }, (_, i) => i + 1).map(
                (n) => {
                  const disabled = updating || n > maxSelectable;
                  return (
                    <Button
                      key={n}
                      type="button"
                      variant={impostorCount === n ? "default" : "outline"}
                      size="sm"
                      disabled={disabled}
                      onClick={() => void onImpostorCountChange(n)}
                      className={cn(
                        "min-w-12 font-mono tabular-nums transition-all",
                        impostorCount === n &&
                        "bg-[#50C878] text-black hover:bg-[#45b86a] hover:text-black shadow-[0_0_20px_rgba(80,200,120,0.25)]"
                      )}
                    >
                      {n}
                    </Button>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-2 border border-border/40 bg-background/40 px-3 py-2.5">
              <span className="font-display text-2xl font-semibold tabular-nums text-[#50C878]">
                {impostorCount}
              </span>
              <span className="text-xs text-muted-foreground">
                défini par l&apos;hôte
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
