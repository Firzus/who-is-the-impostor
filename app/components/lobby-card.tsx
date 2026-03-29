import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LobbyPlayer } from "@/stores/lobby-store";

interface LobbyCardProps {
  player: LobbyPlayer;
  isMe: boolean;
}

export function LobbyCard({ player, isMe }: LobbyCardProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-(--radius) border p-3 transition-all duration-200",
        isMe
          ? "border-primary/20 bg-primary/5 glow-gold"
          : "border-border/50 bg-card/40 hover:border-border hover:bg-card/60"
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback>
          {player.isHost ? (
            <Crown className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{player.name}</span>
      </div>

      <div className="flex gap-2">
        {player.isHost && (
          <Badge variant="default" className="text-[10px] uppercase tracking-wider">
            Hôte
          </Badge>
        )}
        {isMe && (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Toi
          </Badge>
        )}
      </div>
    </div>
  );
}
