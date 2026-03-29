import {
  createFileRoute,
  Outlet,
  useMatch,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LobbyCard } from "@/components/lobby-card";
import { useLobbyPolling } from "@/lib/ws-client";
import { useLobbyStore } from "@/stores/lobby-store";
import { assignRoles } from "@/server/functions/lobby";
import { Copy, Users, Loader2 } from "lucide-react";

export const Route = createFileRoute("/lobby/$code")({
  component: LobbyPage,
});

function LobbyPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const store = useLobbyStore();
  const [assigning, setAssigning] = useState(false);

  const revealMatch = useMatch({
    from: "/lobby/$code/reveal",
    shouldThrow: false,
  });
  const isRevealRoute = !!revealMatch;

  useLobbyPolling(isRevealRoute ? "" : code);

  const codeRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<HTMLDivElement>(null);

  const isHost = store.players.find(
    (p) => p.id === store.myPlayerId
  )?.isHost;

  const canAssignRoles = isHost && store.players.length >= 3 && !assigning;

  useEffect(() => {
    if (!isRevealRoute && store.rolesAssigned) {
      navigate({ to: "/lobby/$code/reveal", params: { code } });
    }
  }, [store.rolesAssigned, navigate, code, isRevealRoute]);

  useEffect(() => {
    if (isRevealRoute) return;
    const codeEl = codeRef.current;
    const playersEl = playersRef.current;
    if (!codeEl || !playersEl) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      codeEl,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6 }
    ).fromTo(
      playersEl,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.3"
    );
  }, [isRevealRoute]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
  };

  const handleAssignRoles = async () => {
    if (!store.lobby || !store.myPlayerId) return;
    setAssigning(true);
    try {
      await assignRoles({
        data: {
          lobbyId: store.lobby.id,
          requesterId: store.myPlayerId,
        },
      });
      // Use getState() after await so we merge onto latest lobby (avoids races with in-flight poll).
      const { lobby, setLobby, setRolesAssigned } = useLobbyStore.getState();
      if (lobby) {
        setLobby({ ...lobby, status: "roles_assigned" });
        setRolesAssigned(true);
      }
    } catch (err: any) {
      store.setError(err.message ?? "Erreur lors de l'attribution");
    } finally {
      setAssigning(false);
    }
  };

  if (isRevealRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <Card ref={codeRef} className="opacity-0 shadow-sm">
          <CardContent className="space-y-3 pt-6 text-center">
            <CardDescription className="text-sm">Code du lobby</CardDescription>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-4xl font-bold tracking-[0.3em] text-foreground">
                {code}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyCode}
                title="Copier le code"
                aria-label="Copier le code"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-aventurier" aria-hidden />
              <span className="text-xs text-muted-foreground">Connecté</span>
            </div>
          </CardContent>
        </Card>

        <Card ref={playersRef} className="opacity-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Joueurs
            </CardTitle>
            <Badge variant="secondary">
              {store.players.length} joueur{store.players.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {store.players.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                En attente de joueurs...
              </div>
            ) : (
              store.players.map((player) => (
                <LobbyCard
                  key={player.id}
                  player={player}
                  isMe={player.id === store.myPlayerId}
                />
              ))
            )}

            {store.players.length > 0 && store.players.length < 3 && (
              <p className="pt-2 text-center text-xs text-muted-foreground">
                Il faut au moins 3 joueurs pour commencer
              </p>
            )}
          </CardContent>
        </Card>

        {isHost && (
          <Button
            onClick={handleAssignRoles}
            disabled={!canAssignRoles}
            className="w-full"
            size="lg"
          >
            {assigning
              ? "Attribution en cours..."
              : store.players.length < 3
                ? `En attente de joueurs (${store.players.length}/3 min.)`
                : "Lancer l'attribution des rôles"}
          </Button>
        )}

        {!isHost && store.myPlayerId && (
          <Alert>
            <AlertDescription className="text-center">
              En attente que l&apos;hôte lance la partie...
            </AlertDescription>
          </Alert>
        )}

        {store.error && (
          <Alert variant="destructive">
            <AlertDescription className="text-center">{store.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
