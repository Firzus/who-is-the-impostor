import { Button } from "@/components/ui/button";

interface LandingActionsProps {
  showActions: boolean;
  onCreate: () => void;
  onJoin: () => void;
  onRevealActions: () => void;
}

export function LandingTitle() {
  return (
    <h1 className="mb-4 text-[clamp(1.75rem,8vw,3.75rem)] font-bold tracking-tight text-foreground">
      <span className="inline-flex items-baseline gap-3 whitespace-nowrap">
        <span className="font-mono">Who Is The</span>
        <span className="bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
          Impostor
        </span>
      </span>
    </h1>
  );
}

export function LandingActions({
  showActions,
  onCreate,
  onJoin,
  onRevealActions,
}: LandingActionsProps) {
  if (!showActions) {
    return (
      <Button
        size="lg"
        className="group relative overflow-hidden px-10 py-6 text-lg font-semibold"
        onClick={onRevealActions}
      >
        <span className="relative z-10">Rejoindre l'aventure</span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size="lg" className="px-8 py-5 text-base" onClick={onCreate}>
        Créer une partie
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="border border-muted-foreground/30 px-8 py-5 text-base hover:border-muted-foreground/50"
        onClick={onJoin}
      >
        Rejoindre par code
      </Button>
    </div>
  );
}
