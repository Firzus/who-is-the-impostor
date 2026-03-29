import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { RoleReveal } from "@/components/role-reveal";
import { RevealConfirmation } from "@/components/reveal-confirmation";
import { useLobbyStore } from "@/stores/lobby-store";
import { getPlayerRole, getLobby } from "@/server/functions/lobby";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/lobby/$code/reveal")({
  head: () => ({
    title: "Rôle — Qui est l'imposteur",
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RevealPage,
});

function RevealPage() {
  const store = useLobbyStore();
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const fetchRole = useCallback(async () => {
    const { myPlayerId, myRole, setMyRole } = useLobbyStore.getState();
    if (!myPlayerId || myRole) return;
    try {
      const result = await getPlayerRole({ data: myPlayerId });
      if (result.role) {
        setMyRole(result.role);
      }
    } catch {
      // retry on next poll
    }
  }, []);

  useEffect(() => {
    fetchRole();
    const interval = setInterval(fetchRole, 2000);
    return () => clearInterval(interval);
  }, [fetchRole]);

  useEffect(() => {
    if (!store.myRole) return;
    const el = containerRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );
  }, [store.myRole]);

  useEffect(() => {
    if (!confirmed) return;
    const el = confirmationRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 }
    );
  }, [confirmed]);

  // Poll lobby status after confirmation to detect "finished"
  useEffect(() => {
    if (!confirmed) return;
    const { lobby } = useLobbyStore.getState();
    if (!lobby) return;

    const pollStatus = async () => {
      try {
        const result = await getLobby({ data: lobby.code });
        useLobbyStore.getState().setLobby(result.lobby);
      } catch {}
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [confirmed]);

  const handleConfirm = () => {
    setConfirmed(true);
    const el = containerRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: 0.3,
      filter: "blur(4px)",
      duration: 0.5,
    });
  };

  if (!store.myRole) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Chargement de ton rôle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-8">
        <div ref={containerRef} className="opacity-0">
          <RoleReveal
            role={store.myRole}
            playerName={
              store.players.find((p) => p.id === store.myPlayerId)?.name ?? ""
            }
            onConfirm={handleConfirm}
          />
        </div>
        {confirmed && (
          <div ref={confirmationRef} className="opacity-0">
            <RevealConfirmation />
          </div>
        )}
      </div>
    </div>
  );
}
