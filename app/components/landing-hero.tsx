import { Button } from "@/components/ui/button";

interface LandingActionsProps {
  onCreate: () => void;
  onJoin: () => void;
}

export function RuneDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <span className="h-px w-8 bg-linear-to-r from-transparent to-[#50C878]/30 sm:w-12" />
      <span className="size-1.5 animate-rune-pulse bg-[#50C878]/35" />
      <span className="h-px w-8 bg-linear-to-l from-transparent to-[#50C878]/30 sm:w-12" />
    </div>
  );
}

export function LandingTitle() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="hero-glow" aria-hidden />

      <RuneDivider />

      <h1 className="mt-6 flex flex-col items-center font-display text-center font-bold leading-[0.9] tracking-tight sm:mt-8">
        <span
          className="text-emerald-gradient text-[clamp(2.6rem,11vw,7.5rem)]"
        >
          {"Qui est l\u2019"}
        </span>
        <span
          className="mt-1 text-[clamp(2.8rem,12vw,8.5rem)] italic text-foreground sm:mt-2"
        >
          imposteur
        </span>
      </h1>

      <div className="mt-4 h-px w-2/3 max-w-xs bg-linear-to-r from-transparent via-[#50C878]/20 to-transparent sm:mt-6" />

      <div className="mt-5 sm:mt-7">
        <RuneDivider />
      </div>
    </div>
  );
}

export function LandingSubtitle() {
  return (
    <p className="max-w-xs text-center text-base italic leading-relaxed text-foreground/80 sm:max-w-md sm:text-xl sm:leading-relaxed">
      Un imposteur se cache parmi les aventuriers, survivrez-vous au
      donjon&nbsp;?
    </p>
  );
}

export function LandingActions({ onCreate, onJoin }: LandingActionsProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
      <Button
        size="xl"
        onClick={onCreate}
        className="hero-shimmer-btn w-full sm:w-auto"
      >
        Créer une partie
      </Button>
      <Button
        size="xl"
        variant="outline"
        onClick={onJoin}
        className="w-full sm:w-auto"
      >
        Rejoindre par code
      </Button>
    </div>
  );
}
