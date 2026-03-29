import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { GameResults } from "@/components/game-results";
import { useLobbyStore } from "@/stores/lobby-store";
import { getLobbyResults } from "@/server/functions/lobby";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/lobby/$code/results")({
  head: () => ({
    title: "Résultats — Qui est l'imposteur",
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: ResultsPage,
});

interface ResultPlayer {
  id: string;
  name: string;
  role: string | null;
  isHost: boolean;
}

function ResultsPage() {
  const navigate = useNavigate();
  const store = useLobbyStore();
  const [results, setResults] = useState<ResultPlayer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    const { lobby, myPlayerId } = useLobbyStore.getState();
    if (!lobby || !myPlayerId) return;

    try {
      const data = await getLobbyResults({
        data: { lobbyId: lobby.id, playerId: myPlayerId },
      });
      setResults(data.players);
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger les résultats");
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleReturnHome = () => {
    useLobbyStore.getState().reset();
    navigate({ to: "/" });
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={handleReturnHome}
            className="text-sm text-muted-foreground underline"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Chargement des résultats...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <GameResults
        players={results}
        myPlayerId={store.myPlayerId}
        onReturnHome={handleReturnHome}
      />
    </div>
  );
}
