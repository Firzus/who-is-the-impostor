import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { cn } from "@/lib/utils";
import { Crown, Home } from "lucide-react";

interface ResultPlayer {
  id: string;
  name: string;
  role: string | null;
  isHost: boolean;
}

interface GameResultsProps {
  players: ResultPlayer[];
  myPlayerId: string | null;
  onReturnHome: () => void;
}

export function GameResults({
  players,
  myPlayerId,
  onReturnHome,
}: GameResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    void getGsap().then((gsap) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    );
  }, []);

  useEffect(() => {
    // Stagger reveal cards one by one
    const timer = setTimeout(() => {
      let delay = 0;
      for (const p of players) {
        setTimeout(() => {
          setRevealed((prev) => new Set([...prev, p.id]));
        }, delay);
        delay += 300;
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [players]);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".result-card");
    void getGsap().then((gsap) =>
      gsap.fromTo(
        cards,
        { opacity: 0, rotateY: 90, scale: 0.8 },
        {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
          delay: 0.5,
          stagger: 0.3,
        }
      )
    );
  }, [players]);

  const impostors = players.filter((p) => p.role === "imposteur");
  const adventurers = players.filter((p) => p.role === "aventurier");

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-8 opacity-0">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-emerald-gradient">
          Résultats de la partie
        </h1>
        <p className="text-sm text-muted-foreground">
          {impostors.length} imposteur{impostors.length > 1 ? "s" : ""} parmi{" "}
          {players.length} joueurs
        </p>
      </div>

      <div ref={cardsRef} className="w-full max-w-md space-y-3">
        {players.map((player) => {
          const isRevealed = revealed.has(player.id);
          const isImpostor = player.role === "imposteur";
          const isMe = player.id === myPlayerId;

          return (
            <div
              key={player.id}
              className="result-card opacity-0"
              style={{ perspective: "600px" }}
            >
              <div
                className={cn(
                  "flex items-center gap-3 border p-4 transition-all duration-500",
                  !isRevealed && "border-border/30 bg-card/20",
                  isRevealed && isImpostor && "border-[#e04040]/20 bg-[#e04040]/5 glow-impostor",
                  isRevealed && !isImpostor && "border-[#D4A017]/20 bg-[#D4A017]/5 glow-aventurier",
                  isMe && "ring-1 ring-[#50C878]/20"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center border transition-all duration-500",
                    isRevealed && isImpostor && "border-[#e04040]/30 bg-[#e04040]/10",
                    isRevealed && !isImpostor && "border-[#D4A017]/30 bg-[#D4A017]/10",
                    !isRevealed && "border-border/40 bg-card/30"
                  )}
                >
                  {isRevealed ? (
                    isImpostor ? (
                      <SkullIcon className="h-5 w-5 text-[#e04040]" aria-hidden="true" />
                    ) : (
                      <SwordIcon className="h-5 w-5 text-[#D4A017]" aria-hidden="true" />
                    )
                  ) : (
                    <span className="text-muted-foreground" aria-hidden="true">?</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <Crown className="h-3 w-3 text-[#50C878]/60" aria-hidden="true" />
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#50C878]">
                        Toi
                      </span>
                    )}
                  </div>
                  {isRevealed && (
                    <span
                      className={cn(
                        "text-xs font-medium uppercase tracking-wider",
                        isImpostor ? "text-[#e04040]" : "text-[#D4A017]"
                      )}
                    >
                      {isImpostor ? "Imposteur" : "Aventurier"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={onReturnHome} size="lg" variant="outline">
          <Home className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
