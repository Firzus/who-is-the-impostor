const PSEUDO_KEY = "who-impostor-pseudo";

export function getSavedPseudo(): string {
  try {
    return localStorage.getItem(PSEUDO_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePseudo(pseudo: string) {
  try {
    localStorage.setItem(PSEUDO_KEY, pseudo);
  } catch {}
}
