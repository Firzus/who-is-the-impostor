export function ScrollIndicator() {
  const handleClick = () => {
    const section = document.getElementById("how-to-play-heading");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      aria-label="Découvrir comment jouer"
    >
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-foreground/70 transition-colors group-hover:text-foreground/90">
        Découvrir
      </span>
      <div className="flex flex-col items-center gap-0.5 animate-bounce">
        <svg
          width="20"
          height="10"
          viewBox="0 0 20 10"
          fill="none"
          className="text-[#50C878]/70 transition-colors group-hover:text-[#50C878]"
        >
          <path
            d="M2 2L10 8L18 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          width="16"
          height="8"
          viewBox="0 0 16 8"
          fill="none"
          className="text-[#50C878]/50 transition-colors group-hover:text-[#50C878]/80"
        >
          <path
            d="M2 1L8 6L14 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
