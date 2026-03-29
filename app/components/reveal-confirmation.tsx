export function RevealConfirmation() {
  return (
    <div className="max-w-sm text-center">
      <p className="font-display text-2xl text-foreground mb-2">
        Bonne chance, aventurier.
      </p>
      <p className="text-sm text-muted-foreground/50 mb-4">
        Rendez-vous en jeu !
      </p>
      <div className="h-px w-16 mx-auto bg-linear-to-r from-transparent via-border to-transparent mb-4" />
      <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
        Tu peux fermer cette page.
      </p>
    </div>
  );
}
