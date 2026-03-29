import { Button } from "@/components/ui/button";

interface LandingActionsProps {
  onCreate: () => void;
  onJoin: () => void;
}

function RuneDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-linear-to-r from-transparent to-[#50C878]/30" />
      <span className="size-1.5 rotate-45 bg-[#50C878]/35" />
      <span className="h-px w-10 bg-linear-to-l from-transparent to-[#50C878]/30" />
    </div>
  );
}

export function LandingTitle() {
  return (
    <div className="relative flex flex-col items-center">
      <RuneDivider />

      <h1 className="mt-5 font-display text-center text-[clamp(1.65rem,7.5vw,5rem)] font-bold leading-none tracking-tight whitespace-nowrap">
        <span className="text-emerald-gradient">{"\u0051ui est l\u2019"}</span>
        <span className="italic text-foreground">imposteur</span>
      </h1>

      <div className="mt-3 h-px w-3/4 max-w-xs bg-linear-to-r from-transparent via-[#50C878]/25 to-transparent" />

      <div className="mt-5">
        <RuneDivider />
      </div>
    </div>
  );
}

export function LandingSubtitle() {
  return (
    <p className="max-w-sm text-center text-lg font-semibold leading-relaxed text-foreground/70 sm:text-xl">
      Un imposteur se cache parmi les aventuriers.
      <br />
      <span className="font-display italic text-foreground/80">
        Survivrez-vous au donjon ?
      </span>
    </p>
  );
}

export function LandingActions({ onCreate, onJoin }: LandingActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        onClick={onCreate}
      >
        Créer une partie
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onJoin}
      >
        Rejoindre par code
      </Button>
    </div>
  );
}
