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
  const [showActions, setShowActions] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <div ref={titleRef} className="opacity-0">
          <LandingTitle />
        </div>

        <p
          ref={subtitleRef}
          className="mb-10 max-w-md text-base text-muted-foreground opacity-0 sm:text-lg"
        >
          Un imposteur se cache parmi les aventuriers.
          <br />
          Survivrez-vous au donjon ?
        </p>

        <div ref={ctaRef} className="flex flex-col items-center gap-4 opacity-0">
          <LandingActions
            showActions={showActions}
            onCreate={() => setShowCreate(true)}
            onJoin={() => setShowJoin(true)}
            onRevealActions={() => setShowActions(true)}
          />
        </div>
      </div>

      <div className="absolute bottom-6 text-xs text-muted-foreground/40 font-mono">
        Who Is The Impostor &mdash; Dofus Community Game
      </div>

      <CreateLobbyDialog open={showCreate} onOpenChange={setShowCreate} />
      <JoinLobbyDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
