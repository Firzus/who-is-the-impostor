import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLobbyStore } from "@/stores/lobby-store";
import { Home } from "lucide-react";

export function RevealConfirmation() {
  const navigate = useNavigate();

  const handleHome = () => {
    useLobbyStore.getState().reset();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-sm text-center">
      <p className="font-display text-2xl text-foreground mb-2">
        Bonne chance, aventurier.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Rendez-vous en jeu !
      </p>
      <div className="h-px w-16 mx-auto bg-linear-to-r from-transparent via-border to-transparent mb-4" />

      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
        Tu peux fermer cette page.
      </p>
      <Button onClick={handleHome} size="sm" variant="ghost" className="text-muted-foreground">
        <Home className="mr-1.5 h-3.5 w-3.5" />
        Retour à l&apos;accueil
      </Button>
    </div>
  );
}
