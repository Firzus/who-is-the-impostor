import {
  createFileRoute,
  Outlet,
  useMatch,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [copied, setCopied] = useState(false);

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

  const canAssignRoles = isHost && store.players.length >= 4 && !assigning;

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
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.8 }
    ).fromTo(
      playersEl,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.3"
    );
  }, [isRevealRoute]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {/* Code display */}
        <div ref={codeRef} className="flex flex-col items-center gap-4 opacity-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Code du lobby
          </p>

          <div className="flex items-center gap-3">
            <span className="text-emerald-gradient font-mono text-5xl font-bold tracking-[0.4em]">
              {code}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={copyCode}
              title="Copier le code"
              aria-label="Copier le code"
              className="text-muted-foreground hover:text-[#50C878]"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#4aba6a] animate-pulse" aria-hidden />
            <span className="text-xs font-medium text-muted-foreground/75">
              {copied ? "Code copié !" : "Connecté"}
            </span>
          </div>

          <div className="h-px w-24 bg-linear-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Players list */}
        <Card ref={playersRef} className="opacity-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-[#50C878]/60" />
              Joueurs
            </CardTitle>
            <Badge variant="secondary">
              {store.players.length} joueur{store.players.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {store.players.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground/50">
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

            {store.players.length > 0 && store.players.length < 4 && (
              <p className="pt-3 text-center text-xs font-medium text-muted-foreground/70">
                Il faut au moins 4 joueurs pour commencer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Host actions */}
        {isHost && (
          <Button
            onClick={handleAssignRoles}
            disabled={!canAssignRoles}
            className="w-full"
            size="lg"
          >
            {assigning
              ? "Attribution en cours..."
              : store.players.length < 4
                ? `En attente de joueurs (${store.players.length}/4 min.)`
                : "Lancer l'attribution des rôles"}
          </Button>
        )}

        {!isHost && store.myPlayerId && (
          <Alert>
            <AlertDescription className="text-center font-display italic">
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
