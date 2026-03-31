import { useEffect, useRef } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Créez ou rejoignez un lobby",
    description:
      "L'hôte crée une partie et partage le code à 6 caractères. Les joueurs rejoignent en un clic.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    accentColor: "#50C878",
    glowColor: "rgba(80, 200, 120, 0.08)",
  },
  {
    number: "2",
    title: "Les rôles sont distribués",
    description:
      "Chaque joueur reçoit secrètement son rôle : aventurier ou imposteur. Personne ne connaît le rôle des autres.",
    icon: (
      <MaskIcon className="h-8 w-8" aria-hidden="true" />
    ),
    accentColor: "#d4a017",
    glowColor: "rgba(212, 160, 23, 0.08)",
  },
  {
    number: "3",
    title: "Survivez au donjon",
    description:
      "Lancez-vous dans l'aventure sur le serveur Ombre. L'imposteur aura toutes les sales choisis pour saboter le donjon. Démasquez-le et terminez le donjon en vie pour remporter la victoire.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Zm0 13.036h.008v.008H12v-.008Z"
        />
      </svg>
    ),
    accentColor: "#e04040",
    glowColor: "rgba(224, 64, 64, 0.08)",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div
      className="step-card group relative flex flex-col items-center gap-5 p-6 text-center sm:p-8"
      style={{
        opacity: 0,
        background: "rgba(10, 14, 20, 0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid rgba(80, 200, 120, 0.08)`,
        boxShadow: "inset 0 1px 0 rgba(80, 200, 120, 0.04), 0 0 0 1px rgba(0,0,0,0.4)",
      }}
    >
      {/* Corner accents */}
      <div className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l" style={{ borderColor: `${step.accentColor}30` }} aria-hidden />
      <div className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t border-r" style={{ borderColor: `${step.accentColor}30` }} aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l" style={{ borderColor: `${step.accentColor}30` }} aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r" style={{ borderColor: `${step.accentColor}30` }} aria-hidden />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${step.glowColor}, transparent 70%)` }}
        aria-hidden
      />

      {/* Step number */}
      <span
        className="font-display text-[11px] font-bold tracking-[0.3em]"
        style={{ color: step.accentColor }}
      >
        ÉTAPE {step.number}
      </span>

      {/* Icon */}
      <div
        className="flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{
          background: step.glowColor,
          border: `1px solid ${step.accentColor}20`,
          color: step.accentColor,
        }}
      >
        {step.icon}
      </div>

      {/* Divider */}
      <div className="h-px w-12" style={{ background: `linear-gradient(90deg, transparent, ${step.accentColor}30, transparent)` }} />

      {/* Text */}
      <h3 className="font-heading text-lg font-bold tracking-wide text-foreground">
        {step.title}
      </h3>
      <p className="max-w-[280px] text-sm leading-relaxed text-foreground/80">
        {step.description}
      </p>

      {/* Connector arrow (between cards) */}
      {index < steps.length - 1 && (
        <div className="step-connector absolute -bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex" aria-hidden>
          <div className="h-6 w-px" style={{ background: `linear-gradient(to bottom, ${step.accentColor}20, transparent)` }} />
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke={`${step.accentColor}40`} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function HowToPlay() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      if (headingRef.current) headingRef.current.style.opacity = "1";
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".step-card");
      cards?.forEach((card) => { card.style.opacity = "1"; });
      return;
    }

    void import("gsap").then(async ({ default: gsap }) => {
      if (cancelled) return;

      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled) return;

      const heading = headingRef.current;
      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              once: true,
            },
            onComplete: () => { heading.style.opacity = "1"; },
          },
        );
      }

      const cards = cardsRef.current?.querySelectorAll(".step-card");
      if (cards) {
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              delay: i * 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                once: true,
              },
              onComplete: () => { (card as HTMLElement).style.opacity = "1"; },
            },
          );
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full px-4 py-24 md:py-32"
      aria-labelledby="how-to-play-heading"
    >
      {/* Section heading */}
      <div ref={headingRef} className="mb-16 flex flex-col items-center gap-4 md:mb-20" style={{ opacity: 0 }}>
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-linear-to-r from-transparent to-[#50C878]/30" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#50C878]">
            Comment jouer
          </span>
          <span className="h-px w-8 bg-linear-to-l from-transparent to-[#50C878]/30" />
        </div>

        <h2
          id="how-to-play-heading"
          className="font-display text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Trois étapes vers le{" "}
          <span className="text-emerald-gradient italic">chaos</span>
        </h2>

        <p className="max-w-md text-center text-sm leading-relaxed text-foreground/75">
          Un concept simple, des trahisons mémorables. Voici comment se déroule une partie.
        </p>

        <div className="mt-2 h-px w-16 bg-linear-to-r from-transparent via-[#50C878]/20 to-transparent" />
      </div>

      {/* Steps grid */}
      <div
        ref={cardsRef}
        className="mx-auto grid max-w-4xl gap-14 md:grid-cols-3 md:gap-8"
      >
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
