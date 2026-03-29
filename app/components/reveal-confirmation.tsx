export function RevealConfirmation() {
  return (
    <div className="max-w-sm text-center">
      <p className="font-display text-2xl text-foreground mb-2">
        Bonne chance, aventurier.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Rendez-vous en jeu !
      </p>
      <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
      <p className="text-xs text-muted-foreground/50">
        Tu peux fermer cette page.
      </p>
    </div>
  );
}
