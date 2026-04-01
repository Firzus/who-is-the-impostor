export function ScrollIndicator() {
  const handleClick = () => {
    const section = document.getElementById("how-to-play-heading");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex cursor-pointer flex-col items-center gap-3 pb-6 sm:pb-8"
      aria-label="Découvrir comment jouer"
    >
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-foreground/50 transition-colors group-hover:text-foreground/80">
        Découvrir
      </span>

      <div className="relative h-8 w-px">
        <div className="absolute inset-0 animate-line-flow bg-linear-to-b from-[#50C878]/60 to-[#50C878]/10" />
      </div>
    </button>
  );
}
