import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevealConfirmation() {
  return (
    <Card className="max-w-md border-primary/10 glow-gold">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="font-display text-2xl font-semibold text-gold-gradient">
          Bonne chance, aventurier.
        </CardTitle>
        <p className="font-display text-base italic text-muted-foreground">
          Rendez-vous sur Dofus pour le donjon !
        </p>
      </CardHeader>
      <CardContent className="pt-0 text-center">
        <div className="mx-auto mb-3 h-px w-16 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          Tu peux fermer cette page.
        </p>
      </CardContent>
    </Card>
  );
}
