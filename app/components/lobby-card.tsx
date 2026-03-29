import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card
      className={cn(
        "border shadow-sm transition-colors",
        isMe ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      )}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {player.isHost ? (
              <Crown className="h-4 w-4 text-yellow-500" />
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
      </CardContent>
    </Card>
  );
}
