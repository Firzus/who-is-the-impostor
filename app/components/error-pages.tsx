import { useRouter } from "@tanstack/react-router";
import { SkullIcon } from "@/components/icons/skull-icon";
import { SwordIcon } from "@/components/icons/sword-icon";
import { Button } from "@/components/ui/button";

function RuneGlyph({ char, className }: { char: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block select-none font-heading text-[#50C878]/20 ${className ?? ""}`}
    >
      {char}
    </span>
  );
}

function FloatingRunes() {
  const glyphs = ["◆", "✦", "⬥", "◈", "⬦", "✧"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {glyphs.map((g, i) => (
        <span
          key={i}
          className="absolute animate-float text-[#50C878]"
          style={{
            left: `${12 + i * 15}%`,
            top: `${18 + (i % 3) * 25}%`,
            opacity: 0.06 + (i % 3) * 0.03,
            fontSize: `${10 + (i % 4) * 4}px`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3.5 + (i % 3)}s`,
          }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}

function HorizontalRune() {
  return (
    <div aria-hidden className="flex items-center gap-3">
      <span className="h-px w-12 bg-linear-to-r from-transparent to-[#50C878]/20" />
      <span className="size-1 rotate-45 bg-[#50C878]/25" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-[#50C878]/20" />
    </div>
  );
}

export function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <FloatingRunes />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(80,200,120,0.06)_0%,transparent_70%)]" />
          <SkullIcon className="relative h-20 w-20 text-[#50C878]/15 drop-shadow-[0_0_30px_rgba(80,200,120,0.1)]" />
        </div>

        <HorizontalRune />

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/50">
          Erreur 404
        </p>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          <span className="text-emerald-gradient">Chemin perdu</span>
        </h1>

        <p className="mt-4 max-w-xs text-base leading-relaxed text-foreground/50">
          Ce passage du donjon n'existe pas.
          <br />
          <span className="font-display italic text-foreground/60">
            L'imposteur a peut-être brouillé les pistes...
          </span>
        </p>

        <div className="mt-3">
          <HorizontalRune />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

        <div className="mt-12 flex items-center gap-4 text-muted-foreground/20">
          <RuneGlyph char="I" className="text-xl" />
          <SwordIcon className="h-5 w-5 rotate-180 opacity-30" />
          <RuneGlyph char="V" className="text-xl" />
        </div>
      </div>
    </div>
  );
}

export function ErrorPage({ error }: { error: unknown }) {
  const router = useRouter();

  const message =
    error instanceof Error ? error.message : "Une erreur inattendue est survenue.";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <FloatingRunes />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(224,64,64,0.08)_0%,transparent_70%)]" />
          <SkullIcon className="relative h-20 w-20 text-impostor/20 drop-shadow-[0_0_30px_rgba(224,64,64,0.12)]" />
        </div>

        <div aria-hidden className="flex items-center gap-3">
          <span className="h-px w-12 bg-linear-to-r from-transparent to-[#e04040]/20" />
          <span className="size-1 rotate-45 bg-[#e04040]/30" />
          <span className="h-px w-12 bg-linear-to-l from-transparent to-[#e04040]/20" />
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-[#e04040]/50">
          Erreur fatale
        </p>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          <span className="text-gradient-impostor">Le donjon s'effondre</span>
        </h1>

        <p className="mt-4 max-w-xs text-base leading-relaxed text-foreground/50">
          Quelque chose a mal tourné.
          <br />
          <span className="font-display italic text-foreground/60">
            L'imposteur a saboté le mécanisme...
          </span>
        </p>

        <div className="glass glass-border mt-6 w-full max-w-sm px-4 py-3">
          <p className="truncate text-left font-mono text-xs text-[#e04040]/70">
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
    </div>
  );
}
