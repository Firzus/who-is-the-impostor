import { useState, useRef, useEffect, memo } from "react";
import { getGsap } from "@/lib/gsap";
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
import { Crown, UserX, ArrowRightLeft } from "lucide-react";
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
        { opacity: 0, x: -12, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: "power2.out" },
      ),
    );
  }, []);

  const handleConfirmKick = async () => {
    if (!onKick) return;
    await onKick(player.id);
    setConfirmOpen(false);
  };

  const initial = player.name.charAt(0).toUpperCase();

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 transition-all duration-200 sm:px-4 sm:py-3",
          isMe
            ? "bg-emerald/4"
            : "hover:bg-white/2",
        )}
      >
        {/* Avatar circle */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center font-heading text-xs font-bold",
            player.isHost
              ? "border border-emerald/30 bg-emerald/10 text-emerald"
              : isMe
                ? "border border-emerald/20 bg-emerald/5 text-emerald/70"
                : "border border-border/40 bg-white/3 text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {player.isHost ? (
            <Crown className="h-3.5 w-3.5" />
          ) : (
            initial
          )}
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-semibold",
              isMe ? "text-foreground" : "text-foreground/85",
            )}
          >
            {player.name}
          </span>
        </div>

        {/* Tags + actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {player.isHost && (
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald/60">
              Hôte
            </span>
          )}
          {isMe && (
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald/40">
              Toi
            </span>
          )}

          {onTransferHost && !player.isHost && !isMe && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-emerald/10 hover:text-emerald"
              aria-label={`Transférer l'hôte à ${player.name}`}
              onClick={() => void onTransferHost(player.id)}
              disabled={transferLoading}
              title="Transférer l'hôte"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </Button>
          )}
          {showKick && !player.isHost && onKick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Expulser ${player.name}`}
              onClick={() => setConfirmOpen(true)}
              disabled={kickLoading}
            >
              <UserX className="h-3 w-3" />
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
