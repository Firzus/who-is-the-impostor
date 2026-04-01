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
import { Badge } from "@/components/ui/badge";
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
import {
  Copy,
  Users,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
  MonitorSmartphone,
  Check,
  Swords,
} from "lucide-react";

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
  useEffect(() => {
    preloadSounds();
  }, []);

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

  const heroRef = useRef<HTMLDivElement>(null);
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
            { scale: 1, duration: 0.4, ease: "back.out(2)" },
          ),
        );
      }
    }
    prevPlayerCount.current = count;
  }, [storePlayers.length]);

  const isHost = storePlayers.find((p) => p.id === myPlayerId)?.isHost;

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
    const heroEl = heroRef.current;
    const settingsEl = settingsRef.current;
    const playersEl = playersRef.current;
    if (!heroEl || !playersEl) return;

    const clearOpacity = (el: HTMLElement | null) => () =>
      el?.classList.remove("opacity-0");

    void getGsap().then((gsap) => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        heroEl,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, onComplete: clearOpacity(heroEl) },
      );
      if (settingsEl && lobby) {
        tl.fromTo(
          settingsEl,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            onComplete: clearOpacity(settingsEl),
          },
          "-=0.4",
        );
      }
      tl.fromTo(
        playersEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, onComplete: clearOpacity(playersEl) },
        "-=0.3",
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
        useLobbyStore
          .getState()
          .setLobby({ ...current, impostorCount: count });
      }
    } catch (err: any) {
      toast.error(
        err.message ?? "Impossible de mettre à jour les paramètres",
      );
    } finally {
      setSettingsUpdating(false);
    }
  };

  const handleKickPlayer = useCallback(
    async (targetPlayerId: string) => {
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
    },
    [lobby, myPlayerId],
  );

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

  const handleTransferHost = useCallback(
    async (targetPlayerId: string) => {
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
    },
    [lobby, myPlayerId],
  );

  if (isRevealRoute) {
    return <Outlet />;
  }

  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center px-4 py-6 sm:px-6 sm:py-8 md:justify-center"
    >
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* ───── Top bar: streamer toggle + leave ───── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="streamer-mode"
              checked={streamer.enabled}
              onCheckedChange={streamer.toggle}
              aria-label="Mode streamer"
            />
            <Label
              htmlFor="streamer-mode"
              className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground select-none"
            >
              <MonitorSmartphone
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <span className="hidden xs:inline">Streamer</span>
            </Label>
          </div>
          {mounted && myPlayerId && (
            <button
              type="button"
              onClick={() => setLeaveOpen(true)}
              className="lobby-leave-btn flex cursor-pointer items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-3 w-3" />
              Quitter
            </button>
          )}
        </div>

        {/* ───── Hero: code display ───── */}
        <div ref={heroRef} className="opacity-0">
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
            <div className="lobby-hero">
              {/* Ambient glow behind the code */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(80,200,120,0.06) 0%, transparent 70%)",
                }}
                aria-hidden
              />

              <div className="relative flex flex-col items-center gap-4 px-5 py-6 sm:py-8">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <span className="h-px w-6 bg-linear-to-r from-transparent to-emerald/30" />
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.4em] text-emerald/50">
                    Code lobby
                  </span>
                  <span className="h-px w-6 bg-linear-to-l from-transparent to-emerald/30" />
                </div>

                {/* Code value */}
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-3xl font-bold tracking-[0.45em] sm:text-4xl md:text-5xl"
                    aria-label={
                      streamer.isCodeHidden
                        ? "Code masqué"
                        : `Code : ${code}`
                    }
                  >
                    {streamer.isCodeHidden ? (
                      <span className="select-none text-muted-foreground/30 blur-[3px]">
                        {maskCode(code)}
                      </span>
                    ) : (
                      <span className="text-emerald-gradient select-all">
                        {code}
                      </span>
                    )}
                  </span>

                  {streamer.enabled && (
                    <button
                      type="button"
                      onClick={() => {
                        if (streamer.revealed) {
                          streamer.hideImmediately();
                        } else {
                          streamer.revealTemporarily(3000);
                        }
                      }}
                      title={
                        streamer.isCodeHidden
                          ? "Révéler le code"
                          : "Code visible"
                      }
                      aria-label={
                        streamer.isCodeHidden
                          ? "Révéler temporairement le code"
                          : "Code actuellement visible"
                      }
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-emerald"
                    >
                      {streamer.isCodeHidden ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4 text-emerald" />
                      )}
                    </button>
                  )}
                </div>

                {/* Action row */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="lobby-action-btn"
                    aria-label="Copier le code"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copié" : "Copier"}</span>
                  </button>

                  <span className="mx-1 h-3 w-px bg-border/30" aria-hidden />

                  <LobbyShare
                    code={code}
                    streamerMode={streamer.isCodeHidden}
                    buttonClassName="lobby-action-btn"
                  />
                </div>

                {/* Status pill */}
                <div
                  className="flex items-center gap-2 transition-all duration-500"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className={
                      copied
                        ? "h-1.5 w-1.5 rounded-full bg-emerald"
                        : "status-blink h-1.5 w-1.5 rounded-full bg-emerald/70"
                    }
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-emerald/50 transition-colors duration-500">
                    {copied ? "Code copié" : "Connecté"}
                  </span>
                </div>
              </div>
            </div>
          </OnboardingTooltip>
        </div>

        {/* ───── Settings panel ───── */}
        {lobby && (
          <div ref={settingsRef} className="opacity-0">
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

        {/* ───── Players section ───── */}
        <div ref={playersRef} className="space-y-3 opacity-0">
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
            <div className="lobby-section">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <Users
                    className="h-3.5 w-3.5 text-emerald/50"
                    aria-hidden="true"
                  />
                  <h2 className="font-heading text-xs font-bold uppercase tracking-[0.15em] text-foreground/80">
                    Joueurs
                  </h2>
                </div>
                <span ref={badgeRef} className="inline-block">
                  <Badge variant="secondary" className="text-[10px]">
                    {storePlayers.length} joueur
                    {storePlayers.length !== 1 ? "s" : ""}
                  </Badge>
                </span>
              </div>

              {/* Player list */}
              <div className="space-y-px px-2 pb-2 sm:px-3 sm:pb-3">
                {storePlayers.length === 0 ? (
                  <div
                    className="flex items-center justify-center py-10 text-muted-foreground"
                    role="status"
                  >
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-sm">En attente de joueurs...</span>
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
                      onTransferHost={
                        isHost ? handleTransferHost : undefined
                      }
                      transferLoading={transferLoading}
                    />
                  ))
                )}
              </div>

              {/* Min players notice */}
              {storePlayers.length > 0 &&
                storePlayers.length < minPlayers && (
                  <div className="border-t border-border/20 px-4 py-3 sm:px-5">
                    <p className="text-center font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {minPlayers - storePlayers.length}{"\u00a0"}joueur{minPlayers - storePlayers.length > 1 ? "s" : ""}{" "}manquant{minPlayers - storePlayers.length > 1 ? "s" : ""} ({storePlayers.length}/{minPlayers})
                    </p>
                  </div>
                )}
            </div>
          </OnboardingTooltip>

          {/* ───── CTA: assign roles / waiting ───── */}
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
                className="lobby-cta w-full"
                size="lg"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Attribution en cours...
                  </>
                ) : storePlayers.length < minPlayers ? (
                  `En attente (${storePlayers.length}/${minPlayers} min.)`
                ) : (
                  <>
                    <Swords className="h-4 w-4" />
                    Lancer la partie
                  </>
                )}
              </Button>
            </OnboardingTooltip>
          )}

          {!isHost && mounted && myPlayerId && (
            <div className="lobby-waiting-notice">
              <div className="status-blink h-1.5 w-1.5 rounded-full bg-emerald/60" />
              <span className="font-display text-sm italic text-foreground/70">
                En attente que l&apos;hôte lance la partie...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ───── Leave dialog ───── */}
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
