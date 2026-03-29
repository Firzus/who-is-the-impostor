import { createHmac } from "node:crypto";

const TOKEN_COOKIE = "who-impostor-token";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return "dev-secret-change-me-in-production";
  }
  return secret;
}

export function signToken(playerId: string, lobbyId: string): string {
  const payload = `${playerId}:${lobbyId}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}:${sig}`;
}

export function verifyToken(token: string): { playerId: string; lobbyId: string } | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [playerId, lobbyId, sig] = parts;
  const expected = createHmac("sha256", getSecret())
    .update(`${playerId}:${lobbyId}`)
    .digest("hex");

  if (sig !== expected) return null;
  return { playerId: playerId!, lobbyId: lobbyId! };
}

export { TOKEN_COOKIE };
