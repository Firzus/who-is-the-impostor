/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShaderBackground } from "@/components/shader-background";
import appCss from "@/styles/app.css?url";

function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-lg font-medium text-foreground">Page introuvable</p>
      <p className="text-sm text-muted-foreground">
        Cette adresse ne correspond à aucune route.
      </p>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: RootNotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Who Is The Impostor" },
      { name: "description", content: "Mini-jeu communautaire Dofus — Trouve l'imposteur avant qu'il ne sabote le donjon !" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap",
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
