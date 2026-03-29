import { type MouseEvent, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Sword, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createHolographicBackground,
  getCardHoverState,
  isRoleCardHoverEnabled,
} from "@/lib/role-card-effects";

interface RoleRevealProps {
  role: string;
  playerName: string;
  onConfirm: () => void;
}

export function RoleReveal({ role, playerName, onConfirm }: RoleRevealProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const holographicRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(false);

  const isImpostor = role === "imposteur";

  useEffect(() => {
    const back = backRef.current;
    if (!back) return;
    gsap.set(back, { rotateY: 180 });
  }, []);

  const handleReveal = () => {
    if (revealed) return;
    const card = cardRef.current;
    if (!card) return;
    const roleContent = card.querySelector<HTMLElement>(".role-content");
    if (!roleContent) return;

    setRevealed(true);
    setHoverEnabled(false);

    const tl = gsap.timeline();
    tl.to(card, {
      rotateY: 180,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => setHoverEnabled(true),
    }).fromTo(
      roleContent,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      "-=0.2"
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

    gsap.to(card, {
      rotateX: hoverState.rotateX,
      rotateY: 180 + hoverState.rotateY,
      scale: hoverState.scale,
      duration: 0.25,
      ease: "power2.out",
      transformPerspective: 1000,
    });

    gsap.to(holographic, {
      opacity: 0.9,
      duration: 0.2,
      ease: "power2.out",
      background: createHolographicBackground({
        pointerX: event.clientX,
        pointerY: event.clientY,
        rect,
      }),
    });
  };

  const handleMouseLeave = () => {
    if (!isRoleCardHoverEnabled({ revealed, animationComplete: hoverEnabled })) {
      return;
    }

    const card = cardRef.current;
    const holographic = holographicRef.current;
    if (!card || !holographic) return;

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
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-sm text-muted-foreground">{playerName}</p>

      <div
        className="relative h-80 w-56 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleReveal}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className="relative h-full w-full transition-shadow"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Card back (visible first) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="mb-4 text-4xl">?</div>
            <p className="text-sm text-muted-foreground">
              Clique pour révéler
            </p>
            <div className="absolute inset-2 rounded-lg border border-border/30" />
          </div>

          {/* Card front (role) */}
          <div
            ref={backRef}
            className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 ${isImpostor
                ? "border-impostor/50 bg-gradient-to-b from-card to-impostor/10"
                : "border-aventurier/50 bg-gradient-to-b from-card to-aventurier/10"
              }`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              ref={holographicRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-screen"
            />
            <div className="role-content flex flex-col items-center opacity-0">
              {isImpostor ? (
                <Skull className="mb-4 h-16 w-16 text-impostor" />
              ) : (
                <Sword className="mb-4 h-16 w-16 text-aventurier" />
              )}

              <h2
                className={`mb-2 font-mono text-2xl font-bold uppercase tracking-wider ${isImpostor ? "text-impostor" : "text-aventurier"
                  }`}
              >
                {role}
              </h2>

              <p className="text-sm text-muted-foreground">
                {isImpostor
                  ? "Sabote le donjon en secret..."
                  : "Termine le donjon avec ta team !"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {revealed && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm italic text-muted-foreground">
            {isImpostor
              ? "Fais perdre la team sans te faire repérer..."
              : "Méfie-toi, un imposteur rôde parmi vous."}
          </p>

          <Button onClick={onConfirm} size="lg" className="px-10">
            C'est parti
          </Button>

          <p className="text-xs text-muted-foreground/60 font-mono">
            Le donjon vous attend...
          </p>
        </div>
      )}
    </div>
  );
}
