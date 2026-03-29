import { Button } from "@/components/ui/button";

interface LandingActionsProps {
  onCreate: () => void;
  onJoin: () => void;
}

export function LandingTitle() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-10 bg-linear-to-r from-transparent to-primary/30" />
        <span className="size-1 rotate-45 bg-primary/40" />
        <span className="h-px w-10 bg-linear-to-l from-transparent to-primary/30" />
      </div>

      <h1 className="font-display text-center text-[clamp(1.65rem,7.5vw,5rem)] font-bold leading-none tracking-tight whitespace-nowrap">
        <span className="text-gold-gradient">{"Qui est l\u2019"}</span>
        <span className="italic text-foreground">imposteur</span>
      </h1>

      <div className="mt-3 h-px w-3/4 max-w-xs bg-linear-to-r from-transparent via-primary/25 to-transparent" />

      <div className="mt-5 flex items-center gap-3">
        <span className="h-px w-10 bg-linear-to-r from-transparent to-primary/30" />
        <span className="size-1 rotate-45 bg-primary/40" />
        <span className="h-px w-10 bg-linear-to-l from-transparent to-primary/30" />
      </div>
    </div>
  );
}

export function LandingActions({ onCreate, onJoin }: LandingActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="px-8 py-5 text-sm uppercase tracking-[0.12em]"
        onClick={onCreate}
      >
        Créer une partie
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="px-8 py-5 text-sm uppercase tracking-[0.12em]"
        onClick={onJoin}
      >
        Rejoindre par code
      </Button>
    </div>
  );
}
