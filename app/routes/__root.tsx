/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect, type ReactNode } from "react";

const ShaderBackground = lazy(() =>
  import("@/components/shader-background").then((m) => ({ default: m.ShaderBackground }))
);
import { NotFoundPage, ErrorPage } from "@/components/error-pages";
import { getSiteUrl } from "@/lib/site-url";
import appCss from "@/styles/app.css?url";

const SITE_TITLE = "Qui est l'imposteur";
const SITE_DESCRIPTION =
  "Mini-jeu communautaire Dofus — Trouve l'imposteur avant qu'il ne sabote le donjon !";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. HTML5.",
  inLanguage: "fr-FR",
} as const;

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
  head: () => {
    const siteUrl = getSiteUrl();
    const canonical = siteUrl ? `${siteUrl}/` : undefined;
    const structured = {
      ...STRUCTURED_DATA,
      ...(canonical ? { url: canonical } : {}),
    };

    return {
      title: SITE_TITLE,
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: SITE_DESCRIPTION },
        {
          name: "keywords",
          content:
            "Dofus, jeu multijoueur, imposteur, party game, jeu en ligne, communautaire",
        },
        { name: "theme-color", content: "#000000" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_TITLE },
        { property: "og:locale", content: "fr_FR" },
        { property: "og:title", content: SITE_TITLE },
        { property: "og:description", content: SITE_DESCRIPTION },
        ...(canonical
          ? ([{ property: "og:url", content: canonical }] as const)
          : []),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: SITE_TITLE },
        { name: "twitter:description", content: SITE_DESCRIPTION },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        ...(canonical ? ([{ rel: "canonical", href: canonical }] as const) : []),
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structured),
        },
      ],
    };
  },
  component: RootComponent,
});

function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClientOnly>
          <Suspense fallback={null}>
            <ShaderBackground />
          </Suspense>
        </ClientOnly>
        <div className="noise-overlay" aria-hidden="true" />
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
