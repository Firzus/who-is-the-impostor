import { type MouseEvent, useRef, useEffect, useState } from "react";
import { getGsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import {
  createHolographicBackground,
  getCardHoverState,
  isRoleCardHoverEnabled,
} from "@/lib/role-card-effects";
import { burstParticles } from "@/lib/reveal-particles";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { playRevealSound } from "@/lib/sound-manager";

interface RoleRevealProps {
  role: string;
  playerName: string;
  onConfirm: () => void;
}

export function RoleReveal({ role, playerName, onConfirm }: RoleRevealProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const holographicRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const particleCleanup = useRef<(() => void) | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(false);

  const isImpostor = role === "imposteur";

  useEffect(() => {
    const back = backRef.current;
    if (!back) return;
    void getGsap().then((gsap) => gsap.set(back, { rotateY: 180 }));
    return () => {
      particleCleanup.current?.();
    };
  }, []);

  const triggerScreenFlash = async () => {
    const flash = flashRef.current;
    if (!flash) return;
    const gsap = await getGsap();
    flash.style.background = isImpostor
      ? "radial-gradient(circle, rgba(224,64,64,0.35), rgba(224,64,64,0) 70%)"
      : "radial-gradient(circle, rgba(212,160,23,0.35), rgba(212,160,23,0) 70%)";
    gsap.fromTo(flash, { opacity: 0 }, {
      opacity: 1,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(flash, { opacity: 0, duration: 0.8, ease: "power2.out" });
      },
    });
  };

  const triggerScreenShake = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const gsap = await getGsap();
    gsap.fromTo(wrapper,
      { x: 0 },
      {
        keyframes: [
          { x: -6, duration: 0.05 },
          { x: 5, duration: 0.05 },
          { x: -4, duration: 0.05 },
          { x: 3, duration: 0.05 },
          { x: -2, duration: 0.05 },
          { x: 0, duration: 0.05 },
        ],
        ease: "none",
      }
    );
  };

  const handleReveal = async () => {
    if (revealed) return;
    const card = cardRef.current;
    if (!card) return;
    const roleContent = card.querySelector<HTMLElement>(".role-content");
    if (!roleContent) return;

    setRevealed(true);
    setHoverEnabled(false);

    const gsap = await getGsap();
    const tl = gsap.timeline();

    tl.to(card, {
      scale: 1.08,
      duration: 0.3,
      ease: "power2.out",
    })
      .to(card, {
        rotateY: 180,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => {
          const canvas = canvasRef.current;
          if (canvas) {
            setTimeout(() => {
              particleCleanup.current?.();
              particleCleanup.current = burstParticles(canvas, role);
              void triggerScreenFlash();
              void triggerScreenShake();
              playRevealSound(role);
            }, 350);
          }
        },
      })
      .to(card, {
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
      }, "-=0.1")
      .fromTo(
        roleContent,
        { opacity: 0, scale: 0.7, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(2.5)" },
        "-=0.3"
      )
      .call(() => setHoverEnabled(true));

    tl.fromTo(card,
      { boxShadow: "0 0 0 rgba(0,0,0,0)" },
      {
        boxShadow: isImpostor
          ? "0 0 60px rgba(224,64,64,0.25), 0 0 120px rgba(224,64,64,0.1)"
          : "0 0 60px rgba(212,160,23,0.25), 0 0 120px rgba(212,160,23,0.1)",
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.6"
    );
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isRoleCardHoverEnabled({ revealed, animationComplete: hoverEnabled })) {
      return;
    }

    const card = cardRef.current;
    const holographic = holographicRef.current;
    if (!card || !holographic) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const hoverState = getCardHoverState({
      pointerX: event.clientX,
      pointerY: event.clientY,
      rect,
    });

    void getGsap().then((gsap) => {
      gsap.to(card, {
        rotateX: hoverState.rotateX,
        rotateY: 180 + hoverState.rotateY,
        scale: hoverState.scale,
        duration: 0.25,
        ease: "power2.out",
        transformPerspective: 1000,
      });

      gsap.to(holographic, {
        opacity: 0.5,
        duration: 0.2,
        ease: "power2.out",
        background: createHolographicBackground({
          pointerX: event.clientX,
          pointerY: event.clientY,
          rect,
        }),
      });
    });
  };

  const handleMouseLeave = () => {
    if (!isRoleCardHoverEnabled({ revealed, animationComplete: hoverEnabled })) {
      return;
    }

    const card = cardRef.current;
    const holographic = holographicRef.current;
    if (!card || !holographic) return;

    void getGsap().then((gsap) => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 180,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
        transformPerspective: 1000,
      });

      gsap.to(holographic, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      });
    });
  };

  return (
    <div ref={wrapperRef} className="flex flex-col items-center gap-8">
      <div
        ref={flashRef}
        className="pointer-events-none fixed inset-0 z-50 opacity-0"
        aria-hidden
      />

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/50">
        {playerName}
      </p>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute -inset-32 z-10"
          style={{ width: "calc(100% + 16rem)", height: "calc(100% + 16rem)" }}
        />
        <div
          className="relative h-[340px] w-[240px] cursor-pointer select-none md:h-[400px] md:w-[280px]"
          style={{ perspective: "1200px" }}
          role="button"
          tabIndex={0}
          aria-label={revealed ? `Ton rôle : ${role}` : "Clique pour révéler ton rôle"}
          onClick={handleReveal}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleReveal();
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={cardRef}
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center border border-border/60 bg-black overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0 grid-bg opacity-40" />
              <div className="absolute inset-0 radial-fade" />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 border border-[#50C878]/20 flex items-center justify-center">
                    <span className="font-display text-4xl text-[#50C878]/80">?</span>
                  </div>
                  <div className="absolute -inset-2 border border-[#50C878]/10 animate-ping" style={{ animationDuration: "2s" }} />
                </div>
                <p className="text-xs text-muted-foreground/60 tracking-wider">
                  Clique pour révéler
                </p>
              </div>

              <div className="absolute inset-3 border border-white/2 pointer-events-none" />
            </div>

            {/* Back face */}
            <div
              ref={backRef}
              className={`absolute inset-0 flex flex-col items-center justify-center border-2 overflow-hidden ${isImpostor
                ? "border-[#e04040]/25 bg-linear-to-b from-black via-[#1a0808] to-[#e04040]/5"
                : "border-[#D4A017]/25 bg-linear-to-b from-black via-[#1a1508] to-[#D4A017]/5"
                }`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div
                ref={holographicRef}
                aria-hidden="true"
                className="card-holographic"
              />
              <div className="role-content flex flex-col items-center opacity-0 relative z-10">
                <div className="relative mb-6">
                  {isImpostor ? (
                    <SkullIcon className="h-20 w-20 text-[#e04040]" />
                  ) : (
                    <SwordIcon className="h-20 w-20 text-[#D4A017]" />
                  )}
                  <div
                    className="absolute inset-0 blur-2xl animate-pulse-glow"
                    style={{
                      background: isImpostor
                        ? "rgba(224,64,64,0.2)"
                        : "rgba(212,160,23,0.2)",
                    }}
                  />
                </div>

                <h2
                  className={`mb-2 font-display text-3xl font-bold tracking-tight uppercase ${isImpostor ? "text-gradient-impostor" : "text-gradient-aventurier"
                    }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </h2>

                <p className="text-center text-sm text-muted-foreground/50">
                  {isImpostor
                    ? "Sabote le donjon en secret..."
                    : "Termine le donjon avec ta team !"}
                </p>
              </div>

              <div className="pointer-events-none absolute inset-3 border border-white/2" />
            </div>
          </div>
        </div>
      </div>

      {revealed && (
        <div className="flex flex-col items-center gap-5">
          <p className="max-w-xs text-center text-sm text-muted-foreground/50">
            {isImpostor
              ? "Fais perdre la team sans te faire repérer..."
              : "Méfie-toi, un imposteur rôde parmi vous."}
          </p>

          <Button onClick={onConfirm} size="lg" className="px-10">
            C&apos;est parti
          </Button>
        </div>
      )}
    </div>
  );
}
