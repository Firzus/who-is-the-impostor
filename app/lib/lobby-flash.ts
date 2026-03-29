/** Session flash after redirect from lobby (e.g. kicked). */
export const LOBBY_FLASH_MESSAGE_KEY = "who-impostor-lobby-flash";

export function setLobbyFlashMessage(message: string): void {
  try {
    sessionStorage.setItem(LOBBY_FLASH_MESSAGE_KEY, message);
  } catch {
    /* ignore */
  }
}

export function consumeLobbyFlashMessage(): string | null {
  try {
    const v = sessionStorage.getItem(LOBBY_FLASH_MESSAGE_KEY);
    if (v) sessionStorage.removeItem(LOBBY_FLASH_MESSAGE_KEY);
    return v;
  } catch {
    return null;
  }
}
