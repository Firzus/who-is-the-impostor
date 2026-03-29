import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { CreateLobbyDialog } from "@/components/create-lobby-dialog";
import { JoinLobbyDialog } from "@/components/join-lobby-dialog";
import { LandingActions, LandingTitle } from "@/components/landing-hero";
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

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
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <Card className="flex w-full max-w-2xl flex-1 flex-col border-none bg-transparent text-card-foreground shadow-none">
        <div className="flex flex-1 flex-col items-center justify-center">
          <CardHeader className="items-center space-y-6 p-0 text-center">
            <div ref={titleRef} className="w-full opacity-0">
              <LandingTitle />
            </div>

            <CardDescription
              ref={subtitleRef}
              className="mb-0 max-w-md text-base opacity-0 sm:text-lg"
            >
              Un imposteur se cache parmi les aventuriers.
              <br />
              Survivrez-vous au donjon ?
            </CardDescription>

            <div ref={ctaRef} className="flex w-full flex-col items-center gap-4 opacity-0">
              <LandingActions
                showActions={showActions}
                onCreate={() => setShowCreate(true)}
                onJoin={() => setShowJoin(true)}
                onRevealActions={() => setShowActions(true)}
              />
            </div>
          </CardHeader>
        </div>

        <CardFooter className="mt-auto flex justify-center border-0 bg-transparent p-0 pb-2 sm:pb-4">
          <CardDescription className="max-w-none text-center text-xs text-muted-foreground/40 font-mono">
            Who Is The Impostor &mdash; Dofus Community Game
          </CardDescription>
        </CardFooter>
      </Card>

      <CreateLobbyDialog open={showCreate} onOpenChange={setShowCreate} />
      <JoinLobbyDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
