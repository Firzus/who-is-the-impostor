import type { default as GSAPType } from "gsap";

let cached: typeof GSAPType | null = null;

export async function getGsap(): Promise<typeof GSAPType> {
  if (cached) return cached;
  const { default: gsap } = await import("gsap");
  cached = gsap;
  return gsap;
}
