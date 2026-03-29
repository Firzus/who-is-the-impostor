import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLobbyStore } from "@/stores/lobby-store";
import { Trophy, Home } from "lucide-react";

export function RevealConfirmation() {
  const navigate = useNavigate();
  const store = useLobbyStore();
  const isFinished = store.lobby?.status === "finished";

  const handleResults = () => {
    if (!store.lobby) return;
    navigate({
      to: "/lobby/$code/results",
      params: { code: store.lobby.code },
    });
  };

  const handleHome = () => {
    useLobbyStore.getState().reset();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-sm text-center">
      <p className="font-display text-2xl text-foreground mb-2">
        Bonne chance, aventurier.
      </p>
      <p className="text-sm text-muted-foreground/50 mb-4">
        Rendez-vous en jeu !
      </p>
      <div className="h-px w-16 mx-auto bg-linear-to-r from-transparent via-border to-transparent mb-4" />

      {isFinished ? (
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-[10px] text-[#50C878]/60 uppercase tracking-wider mb-1">
            Tous les joueurs ont vu leur rôle
          </p>
          <Button onClick={handleResults} size="sm" variant="outline">
            <Trophy className="mr-1.5 h-3.5 w-3.5" />
            Voir les résultats
          </Button>
          <Button onClick={handleHome} size="sm" variant="ghost" className="text-muted-foreground/50">
            <Home className="mr-1.5 h-3.5 w-3.5" />
            Retour à l&apos;accueil
          </Button>
        </div>
      ) : (
        <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
          Tu peux fermer cette page.
        </p>
      )}
    </div>
  );
}
