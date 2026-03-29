import { Badge } from "@/components/ui/badge";
import { User, Crown } from "lucide-react";
import type { LobbyPlayer } from "@/stores/lobby-store";

interface LobbyCardProps {
  player: LobbyPlayer;
  isMe: boolean;
}

export function LobbyCard({ player, isMe }: LobbyCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[var(--radius)] border p-3 transition-colors ${
        isMe ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        {player.isHost ? (
          <Crown className="h-4 w-4 text-yellow-500" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">
          {player.name}
        </span>
      </div>

      <div className="flex gap-2">
        {player.isHost && (
          <Badge variant="secondary" className="text-xs">
            Hôte
          </Badge>
        )}
        {isMe && (
          <Badge variant="outline" className="text-xs">
            Toi
          </Badge>
        )}
      </div>
    </div>
  );
}
