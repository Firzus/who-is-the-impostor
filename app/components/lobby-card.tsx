import { useState, useRef, useEffect, memo } from "react";
import { getGsap } from "@/lib/gsap";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { User, Crown, UserX, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LobbyPlayer } from "@/stores/lobby-store";

interface LobbyCardProps {
  player: LobbyPlayer;
  isMe: boolean;
  showKick?: boolean;
  onKick?: (playerId: string) => void | Promise<void>;
  kickLoading?: boolean;
  onTransferHost?: (playerId: string) => void | Promise<void>;
  transferLoading?: boolean;
}

export const LobbyCard = memo(function LobbyCard({
  player,
  isMe,
  showKick,
  onKick,
  kickLoading,
  onTransferHost,
  transferLoading,
}: LobbyCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    void getGsap().then((gsap) =>
      gsap.fromTo(
        el,
        { opacity: 0, x: -16, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      )
    );
  }, []);

  const handleConfirmKick = async () => {
    if (!onKick) return;
    await onKick(player.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <div
        ref={cardRef}
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
          {onTransferHost && !player.isHost && !isMe && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-[#50C878]/10 hover:text-[#50C878]"
              aria-label={`Transférer l'hôte à ${player.name}`}
              onClick={() => void onTransferHost(player.id)}
              disabled={transferLoading}
              title="Transférer l'hôte"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Expulser {player.name}&nbsp;?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce joueur sera retiré du lobby et ne pourra pas le rejoindre
              immédiatement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmKick()}
              disabled={kickLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Expulser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
