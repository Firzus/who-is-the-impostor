import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CreateLobbyDialog } from "@/components/create-lobby-dialog";
import { JoinLobbyDialog } from "@/components/join-lobby-dialog";
import {
  LandingActions,
  LandingTitle,
  LandingSubtitle,
} from "@/components/landing-hero";
import { consumeLobbyFlashMessage } from "@/lib/lobby-flash";

export const Route = createFileRoute("/")(
  { component: LandingPage },
);

function LandingPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    const msg = consumeLobbyFlashMessage();
    if (msg) toast.error(msg);
  }, []);

  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerTagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let tl: { kill: () => void } | null = null;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      const clearOpacity = (ref: React.RefObject<HTMLDivElement | null>) => () =>
        ref.current?.classList.remove("opacity-0");

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.4, onComplete: clearOpacity(titleRef) }
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, onComplete: clearOpacity(subtitleRef) },
          "-=0.6"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, onComplete: clearOpacity(ctaRef) },
          "-=0.5"
        )
        .fromTo(
          footerTagRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, onComplete: clearOpacity(footerTagRef) },
          "-=0.3"
        );

      tl = timeline;
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8 text-center">
            <div ref={titleRef} className="w-full opacity-0">
              <LandingTitle />
            </div>

            <div ref={subtitleRef} className="opacity-0">
              <LandingSubtitle />
            </div>

            <div ref={ctaRef} className="flex w-full flex-col items-center gap-4 opacity-0">
              <LandingActions
                onCreate={() => setShowCreate(true)}
                onJoin={() => setShowJoin(true)}
              />
            </div>
          </div>
        </div>

        <div ref={footerTagRef} className="mt-auto pb-4 opacity-0">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/65">
            {"Qui est l'imposteur — jeu communautaire Dofus"}
          </p>
        </div>
      </main>

      <CreateLobbyDialog open={showCreate} onOpenChange={setShowCreate} />
      <JoinLobbyDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
