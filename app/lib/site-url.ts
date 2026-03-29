/**
 * Canonical origin for absolute URLs in meta tags (Open Graph, canonical).
 * Set VITE_SITE_URL at build time in production (e.g. https://your-domain.com).
 */
export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined;
  if (raw?.trim()) {
    return raw.trim().replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  return "";
}
