import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RevealConfirmation() {
  return (
    <Card className="max-w-md border-dashed shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-xl font-medium">Bonne chance, aventurier.</CardTitle>
        <CardDescription className="text-base">
          Rendez-vous sur Dofus pour le donjon !
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 text-center">
        <CardDescription className="font-mono text-sm text-muted-foreground/40">
          Tu peux fermer cette page.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
