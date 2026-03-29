import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Crown, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LobbyPlayer } from "@/stores/lobby-store";

interface LobbyCardProps {
  player: LobbyPlayer;
  isMe: boolean;
  showKick?: boolean;
  onKick?: (playerId: string) => void | Promise<void>;
  kickLoading?: boolean;
}

export function LobbyCard({
  player,
  isMe,
  showKick,
  onKick,
  kickLoading,
}: LobbyCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmKick = async () => {
    if (!onKick) return;
    await onKick(player.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 border p-3 transition-all duration-200",
          isMe
            ? "border-[#50C878]/15 bg-[#50C878]/3 glow-emerald"
            : "border-border/40 bg-card/30 hover:border-border/60 hover:bg-card/50"
        )}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {player.isHost ? (
              <Crown className="h-4 w-4 text-[#50C878]" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {player.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {player.isHost && (
            <Badge
              variant="default"
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              Hôte
            </Badge>
          )}
          {isMe && (
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              Toi
            </Badge>
          )}
          {showKick && !player.isHost && onKick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Expulser ${player.name}`}
              onClick={() => setConfirmOpen(true)}
              disabled={kickLoading}
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Expulser {player.name}&nbsp;?</DialogTitle>
            <DialogDescription>
              Ce joueur sera retiré du lobby et ne pourra pas le rejoindre
              immédiatement.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmKick()}
              disabled={kickLoading}
            >
              Expulser
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
