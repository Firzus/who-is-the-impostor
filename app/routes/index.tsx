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
import { HowToPlay } from "@/components/how-to-play";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { LandingFooter } from "@/components/landing-footer";
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

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerTagRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      [titleRef, subtitleRef, ctaRef, footerTagRef, scrollIndicatorRef].forEach(
        (ref) => {
          if (ref.current) ref.current.classList.remove("opacity-0");
        }
      );
      return;
    }

    let cancelled = false;
    let tl: { kill: () => void } | null = null;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      const clearOpacity =
        (ref: React.RefObject<HTMLDivElement | null>) => () =>
          ref.current?.classList.remove("opacity-0");

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: 0.6,
      });

      timeline
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 80, scale: 0.96, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 2,
            onComplete: clearOpacity(titleRef),
          }
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            onComplete: clearOpacity(subtitleRef),
          },
          "-=0.8"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            onComplete: clearOpacity(ctaRef),
          },
          "-=0.5"
        )
        .fromTo(
          footerTagRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            onComplete: clearOpacity(footerTagRef),
          },
          "-=0.3"
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: clearOpacity(scrollIndicatorRef),
          },
          "-=0.5"
        );

      tl = timeline;
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div id="main-content" className="flex flex-col items-center overflow-x-hidden">
      {/* Hero */}
      <main
        ref={heroRef}
        className="relative flex min-h-svh w-full flex-col items-center justify-center px-6 py-8 sm:px-8"
      >
        <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center lg:max-w-3xl">
          <div className="flex flex-col items-center gap-8 text-center sm:gap-10 md:gap-12">
            <div ref={titleRef} className="w-full opacity-0">
              <LandingTitle />
            </div>

            <div ref={subtitleRef} className="opacity-0">
              <LandingSubtitle />
            </div>

            <div
              ref={ctaRef}
              className="flex w-full flex-col items-center gap-4 opacity-0 sm:w-auto"
            >
              <LandingActions
                onCreate={() => setShowCreate(true)}
                onJoin={() => setShowJoin(true)}
              />
            </div>
          </div>
        </div>

        <div ref={footerTagRef} className="mt-auto opacity-0">
          <div className="mb-3 flex justify-center">
            <div className="h-px w-16 bg-linear-to-r from-transparent via-[#50C878]/15 to-transparent sm:w-20" />
          </div>
          <p className="text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 sm:text-[10px]">
            {"Qui est l\u2019imposteur \u2014 jeu communautaire Dofus"}
          </p>
        </div>

        <div ref={scrollIndicatorRef} className="mt-5 opacity-0 sm:mt-6">
          <ScrollIndicator />
        </div>
      </main>

      {/* How to play */}
      <HowToPlay />

      {/* Bottom CTA */}
      <section
        className="flex w-full flex-col items-center gap-7 px-6 py-16 sm:gap-8 sm:py-24 md:py-32"
        aria-label="Rejoindre une partie"
      >
        <div className="relative h-px w-28 overflow-hidden sm:w-36">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#50C878]/20 to-transparent" />
          <div className="animate-shimmer-slide absolute inset-0 bg-linear-to-r from-transparent via-[#50C878]/30 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-lg font-semibold text-foreground/85 sm:text-xl">
            Prêt à trahir vos amis&nbsp;?
          </p>
          <p className="text-center text-sm text-foreground/50">
            Créez un lobby en quelques secondes.
          </p>
        </div>

        <LandingActions
          onCreate={() => setShowCreate(true)}
          onJoin={() => setShowJoin(true)}
        />
      </section>

      {/* Footer */}
      <LandingFooter />

      <CreateLobbyDialog open={showCreate} onOpenChange={setShowCreate} />
      <JoinLobbyDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
