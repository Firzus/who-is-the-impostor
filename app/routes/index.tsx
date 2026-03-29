import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { CreateLobbyDialog } from "@/components/create-lobby-dialog";
import { JoinLobbyDialog } from "@/components/join-lobby-dialog";
import { LandingActions, LandingTitle } from "@/components/landing-hero";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 50, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.5"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.4"
      )
      .fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.2"
      );
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 text-center">
          <div ref={titleRef} className="w-full opacity-0">
            <LandingTitle />
          </div>

          <p
            ref={subtitleRef}
            className="max-w-sm text-base leading-relaxed text-muted-foreground opacity-0 sm:text-lg"
          >
            Un imposteur se cache parmi les aventuriers.
            <br />
            <span className="font-display italic text-foreground/70">
              Survivrez-vous au donjon ?
            </span>
          </p>

          <div ref={ctaRef} className="flex w-full flex-col items-center gap-4 opacity-0">
            <LandingActions
              onCreate={() => setShowCreate(true)}
              onJoin={() => setShowJoin(true)}
            />
          </div>
        </div>
      </div>

      <div
        ref={footerRef}
        className="mt-auto pb-4 opacity-0"
      >
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30">
          {"Qui est l'imposteur — jeu communautaire Dofus"}
        </p>
      </div>

      <CreateLobbyDialog open={showCreate} onOpenChange={setShowCreate} />
      <JoinLobbyDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
