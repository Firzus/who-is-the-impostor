import { Link } from "@tanstack/react-router";
import { RuneDivider } from "@/components/landing-hero";

export function LandingFooter() {
  return (
    <footer
      className="w-full border-t border-[#50C878]/5 px-6 py-14 sm:py-16"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
        <RuneDivider />

        <span className="font-display text-sm tracking-wide text-[#50C878]/50 sm:text-base">
          {"Qui est l\u2019imposteur"}
        </span>

        <nav
          className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6"
          aria-label="Navigation du pied de page"
        >
          <Link
            to="/"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-[#50C878] sm:text-xs"
          >
            Accueil
          </Link>
          <span className="hidden text-muted-foreground/30 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-[#50C878] sm:text-xs"
          >
            Mentions légales
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground/50 sm:text-xs">
            © 2024&nbsp;-&nbsp;2026 Huzounet.
          </p>
          <p className="max-w-xs font-mono text-[9px] leading-relaxed tracking-wide text-muted-foreground/35 sm:max-w-md sm:text-[10px]">
            Certaines illustrations sont la propriété d&apos;Ankama Studio et de
            Dofus&nbsp;— Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
