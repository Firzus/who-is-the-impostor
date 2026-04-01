import { useRouter } from "@tanstack/react-router";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { Button } from "@/components/ui/button";

const RUNE_GLYPHS = [
  { char: "◆", left: "8%", top: "12%", opacity: 0.04, size: 14, duration: "9s", delay: "0s" },
  { char: "✦", left: "85%", top: "20%", opacity: 0.06, size: 10, duration: "11s", delay: "1.2s" },
  { char: "⬥", left: "18%", top: "72%", opacity: 0.035, size: 18, duration: "13s", delay: "2.8s" },
  { char: "◈", left: "78%", top: "65%", opacity: 0.05, size: 12, duration: "10s", delay: "0.6s" },
  { char: "⬦", left: "50%", top: "85%", opacity: 0.03, size: 16, duration: "12s", delay: "3.5s" },
  { char: "✧", left: "92%", top: "45%", opacity: 0.045, size: 11, duration: "8s", delay: "1.8s" },
  { char: "◇", left: "4%", top: "42%", opacity: 0.04, size: 13, duration: "14s", delay: "4.2s" },
  { char: "⊹", left: "65%", top: "8%", opacity: 0.035, size: 10, duration: "10s", delay: "2.1s" },
] as const;

function FloatingRunes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {RUNE_GLYPHS.map((r, i) => (
        <span
          key={i}
          className="absolute animate-drift text-[#50C878]"
          style={{
            left: r.left,
            top: r.top,
            fontSize: `${r.size}px`,
            "--drift-opacity": r.opacity,
            "--drift-duration": r.duration,
            "--drift-delay": r.delay,
          } as React.CSSProperties}
        >
          {r.char}
        </span>
      ))}
    </div>
  );
}

function HorizontalRune() {
  return (
    <div aria-hidden className="flex items-center gap-4">
      <span className="h-px w-16 animate-rune-shimmer bg-linear-to-r from-transparent to-[#50C878]/30 sm:w-20" />
      <span className="size-1.5 rotate-45 bg-[#50C878]/30" />
      <span className="h-px w-16 animate-rune-shimmer bg-linear-to-l from-transparent to-[#50C878]/30 sm:w-20" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}

function Ghost404() {
  return (
    <span
      aria-hidden
      className="animate-ghost-404 pointer-events-none absolute select-none font-heading text-[clamp(8rem,22vw,14rem)] font-bold leading-none tracking-tight text-[#50C878]/3"
      style={{ top: "50%", left: "50%", transform: "translate(-50%, -55%)" }}
    >
      404
    </span>
  );
}

export function NotFoundPage() {
  const router = useRouter();

  return (
    <main id="main-content" className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <FloatingRunes />
      <Ghost404 />

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* Skull with glow */}
        <div className="relative mb-10" aria-hidden="true">
          <div className="absolute -inset-16 bg-[radial-gradient(circle,rgba(80,200,120,0.08)_0%,transparent_65%)]" />
          <SkullIcon className="animate-skull-breathe relative h-28 w-28 text-[#50C878]/20 sm:h-32 sm:w-32" />
        </div>

        <HorizontalRune />

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.4em] text-[#50C878]/50">
          Erreur 404
        </p>

        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          <span className="text-emerald-gradient drop-shadow-[0_0_30px_rgba(80,200,120,0.15)]">
            Chemin perdu
          </span>
        </h1>

        <p className="mt-6 max-w-sm text-lg leading-relaxed text-foreground/70">
          Ce passage du donjon n'existe pas.
          <br />
          <span className="font-display italic text-foreground/85">
            L'imposteur a peut-être brouillé les pistes...
          </span>
        </p>

        <div className="mt-8">
          <HorizontalRune />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button size="lg" onClick={() => router.navigate({ to: "/" })}>
            Retour au camp
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.history.back()}
          >
            Rebrousser chemin
          </Button>
        </div>

        <div className="mt-16 flex items-center gap-5 text-muted-foreground/15" aria-hidden="true">
          <span className="inline-block select-none font-heading text-lg text-[#50C878]/15">I</span>
          <SwordIcon className="h-5 w-5 rotate-180 opacity-20" />
          <span className="inline-block select-none font-heading text-lg text-[#50C878]/15">V</span>
        </div>
      </div>
    </main>
  );
}

export function ErrorPage({ error }: { error: unknown }) {
  const router = useRouter();

  const message =
    error instanceof Error ? error.message : "Une erreur inattendue est survenue.";

  return (
    <main id="main-content" className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <FloatingRunes />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-6" aria-hidden="true">
          <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(224,64,64,0.08)_0%,transparent_70%)]" />
          <SkullIcon className="relative h-20 w-20 text-impostor/20 drop-shadow-[0_0_30px_rgba(224,64,64,0.12)]" />
        </div>

        <div aria-hidden className="flex items-center gap-3">
          <span className="h-px w-12 bg-linear-to-r from-transparent to-[#e04040]/20" />
          <span className="size-1 rotate-45 bg-[#e04040]/30" />
          <span className="h-px w-12 bg-linear-to-l from-transparent to-[#e04040]/20" />
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-[#e04040]">
          Erreur fatale
        </p>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          <span className="text-gradient-impostor">Le donjon s'effondre</span>
        </h1>

        <p className="mt-4 max-w-xs text-base leading-relaxed text-foreground/75">
          Quelque chose a mal tourné.
          <br />
          <span className="font-display italic text-foreground/85">
            L'imposteur a saboté le mécanisme...
          </span>
        </p>

        <div className="glass glass-border mt-6 w-full max-w-sm px-4 py-3">
          <p className="truncate text-left font-mono text-xs text-[#e04040]" role="alert">
            {message}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.invalidate()}
          >
            Réessayer
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.navigate({ to: "/" })}
          >
            Retour au camp
          </Button>
        </div>
      </div>
    </main>
  );
}
