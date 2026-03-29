export function RevealConfirmation() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-xl font-medium text-foreground">
        Bonne chance, aventurier.
      </p>
      <p className="text-base text-muted-foreground">
        Rendez-vous sur Dofus pour le donjon !
      </p>
      <p className="mt-4 font-mono text-sm text-muted-foreground/40">
        Tu peux fermer cette page.
      </p>
    </div>
  );
}
