/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import appCss from "@/styles/app.css?url";

function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card className="glass glass-border w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-lg">Page introuvable</CardTitle>
          <CardDescription>Cette adresse ne correspond à aucune route.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: RootNotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Qui est l'imposteur" },
      { name: "description", content: "Mini-jeu communautaire Dofus — Trouve l'imposteur avant qu'il ne sabote le donjon !" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ShaderBackground />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}
