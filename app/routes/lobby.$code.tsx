import {
  createFileRoute,
  Outlet,
  useMatch,
  useNavigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LobbyCard } from "@/components/lobby-card";
import { LobbySettings } from "@/components/lobby-settings";
import { useLobbyPolling } from "@/lib/lobby-events";
import { preloadSounds } from "@/lib/sound-manager";
import { useLobbyStore } from "@/stores/lobby-store";
import { setLobbyFlashMessage } from "@/lib/lobby-flash";
import { setKickCooldown } from "@/lib/kick-cooldown";
import { minPlayersForLobby } from "@/lib/lobby-lifecycle";
import {
  assignRoles,
  kickPlayer,
  updateLobbySettings,
  transferHost,
  leaveLobby,
} from "@/server/functions/lobby";
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
import { LobbyShare } from "@/components/lobby-share";
import { OnboardingTooltip } from "@/components/onboarding-tooltip";
import { useOnboarding } from "@/lib/use-onboarding";
import { useStreamerMode, maskCode } from "@/lib/use-streamer-mode";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Users, Loader2, LogOut, Eye, EyeOff, MonitorSmartphone } from "lucide-react";

export const Route = createFileRoute("/lobby/$code")({
  head: () => ({
    title: "Partie — Qui est l'imposteur",
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: LobbyPage,
});

function LobbyPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const lobby = useLobbyStore((s) => s.lobby);
  const storePlayers = useLobbyStore((s) => s.players);
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const rolesAssigned = useLobbyStore((s) => s.rolesAssigned);
  const [assigning, setAssigning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsUpdating, setSettingsUpdating] = useState(false);
  const [kickLoading, setKickLoading] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const onboarding = useOnboarding();
  const streamer = useStreamerMode();

  useEffect(() => setMounted(true), []);
  useEffect(() => { preloadSounds(); }, []);

  const revealMatch = useMatch({
    from: "/lobby/$code/reveal",
    shouldThrow: false,
  });
  const isRevealRoute = !!revealMatch;

  const handleKickedFromLobby = useCallback(() => {
    setKickCooldown(code);
    setLobbyFlashMessage("Vous avez été expulsé du lobby.");
    useLobbyStore.getState().reset();
    navigate({ to: "/" });
  }, [code, navigate]);

  useLobbyPolling(isRevealRoute ? "" : code, {
    onKickedFromLobby: handleKickedFromLobby,
  });

  const codeRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevPlayerCount = useRef(storePlayers.length);

  useEffect(() => {
    const count = storePlayers.length;
    if (count !== prevPlayerCount.current && prevPlayerCount.current > 0) {
      const el = badgeRef.current;
      if (el) {
        void getGsap().then((gsap) =>
          gsap.fromTo(
            el,
            { scale: 1.3 },
            { scale: 1, duration: 0.4, ease: "back.out(2)" }
          )
        );
      }
    }
    prevPlayerCount.current = count;
  }, [storePlayers.length]);

  const isHost = storePlayers.find(
    (p) => p.id === myPlayerId
  )?.isHost;

  const impostorCount = lobby?.impostorCount ?? 1;
  const minPlayers = minPlayersForLobby(impostorCount);
  const canAssignRoles =
    isHost && storePlayers.length >= minPlayers && !assigning;

  useEffect(() => {
    if (!isRevealRoute && rolesAssigned) {
      navigate({ to: "/lobby/$code/reveal", params: { code } });
    }
  }, [rolesAssigned, navigate, code, isRevealRoute]);

  useEffect(() => {
    if (isRevealRoute) return;
    const codeEl = codeRef.current;
    const settingsEl = settingsRef.current;
    const playersEl = playersRef.current;
    if (!codeEl || !playersEl) return;

    const clearOpacity = (el: HTMLElement | null) => () =>
      el?.classList.remove("opacity-0");

    void getGsap().then((gsap) => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        codeEl,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.8, onComplete: clearOpacity(codeEl) }
      );
      if (settingsEl && lobby) {
        tl.fromTo(
          settingsEl,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, onComplete: clearOpacity(settingsEl) },
          "-=0.45"
        );
      }
      tl.fromTo(
        playersEl,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, onComplete: clearOpacity(playersEl) },
        "-=0.35"
      );
    });
  }, [isRevealRoute, lobby?.id]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAssignRoles = async () => {
    if (!lobby || !myPlayerId) return;
    setAssigning(true);
    try {
      await assignRoles({
        data: {
          lobbyId: lobby.id,
          requesterId: myPlayerId,
        },
      });
      const state = useLobbyStore.getState();
      if (state.lobby) {
        state.setLobby({ ...state.lobby, status: "roles_assigned" });
        state.setRolesAssigned(true);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de l'attribution");
    } finally {
      setAssigning(false);
    }
  };

  const handleImpostorCountChange = async (count: number) => {
    if (!lobby || !myPlayerId) return;
    setSettingsUpdating(true);
    try {
      await updateLobbySettings({
        data: {
          lobbyId: lobby.id,
          requesterId: myPlayerId,
          impostorCount: count,
        },
      });
      const current = useLobbyStore.getState().lobby;
      if (current) {
        useLobbyStore.getState().setLobby({ ...current, impostorCount: count });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de mettre à jour les paramètres");
    } finally {
      setSettingsUpdating(false);
    }
  };

  const handleKickPlayer = useCallback(async (targetPlayerId: string) => {
    if (!lobby || !myPlayerId) return;
    setKickLoading(true);
    try {
      await kickPlayer({
        data: {
          lobbyId: lobby.id,
          requesterId: myPlayerId,
          targetPlayerId,
        },
      });
    } catch (err: any) {
      toast.error(err.message ?? "Impossible d'expulser ce joueur");
    } finally {
      setKickLoading(false);
    }
  }, [lobby, myPlayerId]);

  const handleLeaveLobby = async () => {
    if (!lobby || !myPlayerId) return;
    setLeaving(true);
    try {
      await leaveLobby({
        data: { lobbyId: lobby.id, playerId: myPlayerId },
      });
      useLobbyStore.getState().reset();
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de quitter le lobby");
    } finally {
      setLeaving(false);
      setLeaveOpen(false);
    }
  };

  const handleTransferHost = useCallback(async (targetPlayerId: string) => {
    if (!lobby || !myPlayerId) return;
    setTransferLoading(true);
    try {
      await transferHost({
        data: {
          lobbyId: lobby.id,
          requesterId: myPlayerId,
          targetPlayerId,
        },
      });
      toast.success("Hôte transféré avec succès");
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de transférer l'hôte");
    } finally {
      setTransferLoading(false);
    }
  }, [lobby, myPlayerId]);

  if (isRevealRoute) {
    return <Outlet />;
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-lg lg:max-w-4xl space-y-6">
        {/* Header: streamer toggle + leave */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="streamer-mode"
              checked={streamer.enabled}
              onCheckedChange={streamer.toggle}
              aria-label="Mode streamer"
            />
            <Label
              htmlFor="streamer-mode"
              className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-muted-foreground select-none"
            >
              <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Streamer</span>
            </Label>
          </div>
          {mounted && myPlayerId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setLeaveOpen(true)}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Quitter
            </Button>
          )}
        </div>

        {/* Code display */}
        <div ref={codeRef} className="flex flex-col items-center gap-5 opacity-0">

          {/* Badge label */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-linear-to-r from-transparent to-[#50C878]/30" />
            <span
              className="font-mono text-[9px] font-semibold uppercase tracking-[0.35em]"
              style={{ color: "rgba(80,200,120,0.55)" }}
            >
              Accès lobby
            </span>
            <span className="h-px w-8 bg-linear-to-l from-transparent to-[#50C878]/30" />
          </div>

          {/* Code container */}
          <OnboardingTooltip
            open={onboarding.isStepActive(0)}
            side="bottom"
            step={0}
            totalSteps={onboarding.totalSteps}
            title="Code du lobby"
            description="Partagez ce code avec vos amis pour qu'ils puissent rejoindre votre partie."
            onNext={onboarding.nextStep}
            onDismiss={onboarding.dismiss}
          >
            <div
              className="relative overflow-hidden"
              style={{
                border: "1px solid rgba(80,200,120,0.2)",
                background: "rgba(80,200,120,0.03)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(80,200,120,0.06), 0 0 32px rgba(80,200,120,0.04)",
              }}
            >
              {/* Corner accents */}
              <span className="lobby-corner-pulse pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[#50C878]/60" aria-hidden />
              <span className="lobby-corner-pulse pointer-events-none absolute top-0 right-0 h-2 w-2 border-t border-r border-[#50C878]/60" aria-hidden />
              <span className="lobby-corner-pulse pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#50C878]/60" aria-hidden />
              <span className="lobby-corner-pulse pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#50C878]/60" aria-hidden />

              {/* Scan line */}
              <span
                className="lobby-scan-line pointer-events-none absolute left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(80,200,120,0.4), transparent)" }}
                aria-hidden
              />

              {/* Inner content */}
              <div className="flex items-center divide-x divide-[#50C878]/10">
                {/* Code */}
                <div className="px-8 py-5">
                  <span
                    className="font-mono text-4xl font-bold tracking-[0.5em] md:text-5xl transition-all duration-300 select-all"
                    aria-label={streamer.isCodeHidden ? "Code masqué" : `Code : ${code}`}
                  >
                    {streamer.isCodeHidden ? (
                      <span className="text-muted-foreground/40 select-none blur-[3px]">
                        {maskCode(code)}
                      </span>
                    ) : (
                      <span className="text-emerald-gradient">{code}</span>
                    )}
                  </span>
                </div>

                {/* Action buttons column */}
                <div className="flex flex-col divide-y divide-[#50C878]/10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyCode}
                    title="Copier le code"
                    aria-label="Copier le code"
                    className="h-10 w-11 rounded-none text-muted-foreground hover:text-[#50C878] hover:bg-[#50C878]/5 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {streamer.enabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (streamer.revealed) {
                          streamer.hideImmediately();
                        } else {
                          streamer.revealTemporarily(3000);
                        }
                      }}
                      title={streamer.isCodeHidden ? "Révéler le code" : "Code visible"}
                      aria-label={streamer.isCodeHidden ? "Révéler temporairement le code" : "Code actuellement visible"}
                      className="h-10 w-11 rounded-none text-muted-foreground hover:text-[#50C878] hover:bg-[#50C878]/5 transition-colors"
                    >
                      {streamer.isCodeHidden ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-[#50C878]" />
                      )}
                    </Button>
                  )}
                  <LobbyShare
                    code={code}
                    streamerMode={streamer.isCodeHidden}
                    buttonClassName="h-10 w-11 rounded-none text-muted-foreground hover:text-[#50C878] hover:bg-[#50C878]/5 transition-colors"
                  />
                </div>
              </div>
            </div>
          </OnboardingTooltip>

          {/* Status pill */}
          <div
            className="flex items-center gap-2.5 px-3 py-1.5 transition-all duration-500"
            style={{
              border: copied
                ? "1px solid rgba(80,200,120,0.35)"
                : "1px solid rgba(80,200,120,0.12)",
              background: copied
                ? "rgba(80,200,120,0.08)"
                : "rgba(80,200,120,0.03)",
            }}
            role="status"
            aria-live="polite"
          >
            <span
              className={copied ? "h-1.5 w-1.5 bg-[#50C878]" : "h-1.5 w-1.5 bg-[#4aba6a] status-blink"}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-500"
              style={{ color: copied ? "#50C878" : "rgba(80,200,120,0.55)" }}
            >
              {copied ? "Code copié" : "Connecté"}
            </span>
          </div>

        </div>

        {/* Two-column layout on large screens */}
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-6 lg:space-y-0">
          {/* Left column: Players */}
          <div className="space-y-6">
            <OnboardingTooltip
              open={onboarding.isStepActive(1)}
              side="top"
              step={1}
              totalSteps={onboarding.totalSteps}
              title="Liste des joueurs"
              description="Tous les joueurs connectés apparaissent ici. Attendez que tout le monde ait rejoint avant de lancer."
              onNext={onboarding.nextStep}
              onDismiss={onboarding.dismiss}
            >
              <Card ref={playersRef} className="opacity-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-[#50C878]/60" aria-hidden="true" />
                    Joueurs
                  </CardTitle>
                  <span ref={badgeRef} className="inline-block">
                    <Badge variant="secondary">
                      {storePlayers.length} joueur{storePlayers.length !== 1 ? "s" : ""}
                    </Badge>
                  </span>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storePlayers.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground" role="status">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      En attente de joueurs...
                    </div>
                  ) : (
                    storePlayers.map((player) => (
                      <LobbyCard
                        key={player.id}
                        player={player}
                        isMe={player.id === myPlayerId}
                        showKick={!!isHost}
                        onKick={handleKickPlayer}
                        kickLoading={kickLoading}
                        onTransferHost={isHost ? handleTransferHost : undefined}
                        transferLoading={transferLoading}
                      />
                    ))
                  )}

                  {storePlayers.length > 0 && storePlayers.length < minPlayers && (
                    <p className="pt-3 text-center text-xs font-medium text-muted-foreground">
                      Il faut au moins {minPlayers} joueurs pour commencer (
                      {storePlayers.length}/{minPlayers})
                    </p>
                  )}
                </CardContent>
              </Card>
            </OnboardingTooltip>

            {/* Host actions - below players on mobile, below players on desktop */}
            {isHost && (
              <OnboardingTooltip
                open={onboarding.isStepActive(2)}
                side="top"
                step={2}
                totalSteps={onboarding.totalSteps}
                title="Lancer la partie"
                description="Quand tous les joueurs sont prêts, lancez l'attribution des rôles pour commencer."
                onNext={onboarding.nextStep}
                onDismiss={onboarding.dismiss}
              >
                <Button
                  onClick={handleAssignRoles}
                  disabled={!canAssignRoles}
                  className="w-full"
                  size="lg"
                >
                  {assigning
                    ? "Attribution en cours..."
                    : storePlayers.length < minPlayers
                      ? `En attente de joueurs (${storePlayers.length}/${minPlayers} min.)`
                      : "Lancer l'attribution des rôles"}
                </Button>
              </OnboardingTooltip>
            )}

            {!isHost && mounted && myPlayerId && (
              <Alert>
                <AlertDescription className="text-center font-display italic">
                  En attente que l&apos;hôte lance la partie...
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right column: Settings (on lg: sticky sidebar) */}
          {lobby && (
            <div ref={settingsRef} className="opacity-0 lg:sticky lg:top-8 lg:self-start order-first lg:order-last">
              <OnboardingTooltip
                open={onboarding.isStepActive(3)}
                side="bottom"
                step={3}
                totalSteps={onboarding.totalSteps}
                title="Configuration"
                description="Choisissez combien d'imposteurs seront dans la partie. Plus il y en a, plus le danger est grand !"
                onNext={onboarding.nextStep}
                onDismiss={onboarding.dismiss}
              >
                <LobbySettings
                  impostorCount={impostorCount}
                  activePlayerCount={storePlayers.length}
                  isHost={!!isHost}
                  updating={settingsUpdating}
                  onImpostorCountChange={handleImpostorCountChange}
                />
              </OnboardingTooltip>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le lobby&nbsp;?</AlertDialogTitle>
            <AlertDialogDescription>
              {isHost
                ? "En tant qu'hôte, le rôle sera transféré au joueur le plus ancien."
                : "Tu seras retiré de la partie en cours."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleLeaveLobby()}
              disabled={leaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {leaving ? "Départ..." : "Quitter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
