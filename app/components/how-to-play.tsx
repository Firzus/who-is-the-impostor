import { useEffect, useRef } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";
import { RuneDivider } from "@/components/landing-hero";

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
    number: "01",
    title: "Rassemblement",
    description:
      "L\u2019hôte crée une partie et partage le code à 6 caractères. Les joueurs rejoignent en un clic.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-7 sm:size-8"
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
    number: "02",
    title: "Distribution",
    description:
      "Chaque joueur reçoit secrètement son rôle\u00a0: aventurier ou imposteur. Personne ne connaît le rôle des autres.",
    icon: <MaskIcon className="size-7 sm:size-8" aria-hidden="true" />,
    accentColor: "#d4a017",
    glowColor: "rgba(212, 160, 23, 0.08)",
  },
  {
    number: "03",
    title: "Survie",
    description:
      "Lancez-vous dans l\u2019aventure sur le serveur Ombre. L\u2019imposteur sabote le donjon tandis que les aventuriers tentent de le démasquer.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-7 sm:size-8"
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

function ChapterDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="h-px w-10 sm:w-16"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}30)`,
        }}
      />
      <span
        className="size-1.5 animate-rune-pulse"
        style={{ backgroundColor: `${color}40` }}
      />
      <span
        className="h-px w-10 sm:w-16"
        style={{
          background: `linear-gradient(90deg, ${color}30, transparent)`,
        }}
      />
    </div>
  );
}

function StepChapter({ step }: { step: Step }) {
  return (
    <div
      className="step-chapter flex flex-col items-center gap-5 text-center sm:gap-6"
      style={{ opacity: 0 }}
    >
      {/* Icon */}
      <div
        className="flex size-16 items-center justify-center sm:size-[72px] md:size-20"
        style={{
          background: step.glowColor,
          border: `1px solid ${step.accentColor}20`,
          color: step.accentColor,
        }}
      >
        {step.icon}
      </div>

      {/* Number + Title */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <span
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{ color: `${step.accentColor}50` }}
        >
          {step.number}
        </span>
        <span
          className="hidden h-4 w-px sm:block"
          style={{ backgroundColor: `${step.accentColor}30` }}
          aria-hidden
        />
        <h3
          className="font-heading text-base font-bold uppercase tracking-[0.15em] text-foreground sm:text-lg"
        >
          {step.title}
        </h3>
      </div>

      {/* Description */}
      <p className="max-w-[300px] text-sm leading-relaxed text-foreground/70 sm:max-w-sm sm:text-base">
        {step.description}
      </p>
    </div>
  );
}

export function HowToPlay() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      if (headingRef.current) headingRef.current.style.opacity = "1";
      const chapters =
        chaptersRef.current?.querySelectorAll<HTMLElement>(".step-chapter");
      chapters?.forEach((ch) => {
        ch.style.opacity = "1";
      });
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
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              once: true,
            },
            onComplete: () => {
              heading.style.opacity = "1";
            },
          }
        );
      }

      const chapters =
        chaptersRef.current?.querySelectorAll(".step-chapter");
      if (chapters) {
        chapters.forEach((chapter, i) => {
          gsap.fromTo(
            chapter,
            { opacity: 0, y: 60, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              delay: i * 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: chapter,
                start: "top 88%",
                once: true,
              },
              onComplete: () => {
                (chapter as HTMLElement).style.opacity = "1";
              },
            }
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
      className="relative w-full px-6 py-16 sm:py-20 md:py-28"
      aria-labelledby="how-to-play-heading"
    >
      {/* Heading */}
      <div
        ref={headingRef}
        className="mb-14 flex flex-col items-center gap-4 sm:mb-16 md:mb-20"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-linear-to-r from-transparent to-[#50C878]/30 sm:w-8" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-[#50C878] sm:text-[10px]">
            Comment jouer
          </span>
          <span className="h-px w-6 bg-linear-to-l from-transparent to-[#50C878]/30 sm:w-8" />
        </div>

        <h2
          id="how-to-play-heading"
          className="font-display text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl"
        >
          Trois étapes vers le{" "}
          <span className="text-emerald-gradient italic">chaos</span>
        </h2>

        <p className="max-w-sm text-center text-sm leading-relaxed text-foreground/60 sm:max-w-md">
          Un concept simple, des trahisons mémorables. Voici comment se
          déroule une partie.
        </p>

        <div className="mt-1 h-px w-12 bg-linear-to-r from-transparent via-[#50C878]/20 to-transparent sm:mt-2 sm:w-16" />
      </div>

      {/* Chapters (vertical sequence) */}
      <div
        ref={chaptersRef}
        className="mx-auto flex max-w-lg flex-col items-center gap-0 lg:max-w-xl"
      >
        {steps.map((step, i) => (
          <div key={step.number} className="flex flex-col items-center">
            <StepChapter step={step} />
            {i < steps.length - 1 && (
              <div className="py-6 sm:py-8 md:py-10">
                <ChapterDivider color={step.accentColor} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
