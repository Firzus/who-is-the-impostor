import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/server/db";
import { lobbies, players } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const Route = createFileRoute("/api/lobby/$code/events")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { code: string } }) => {
        const code = params.code.toUpperCase();

        const [lobby] = await db
          .select()
          .from(lobbies)
          .where(eq(lobbies.code, code));

        if (!lobby) {
          return new Response("Lobby introuvable", { status: 404 });
        }

        const encoder = new TextEncoder();
        let closed = false;

        const stream = new ReadableStream({
          async start(controller) {
            let lastHash = "";

            const send = (event: string, data: unknown) => {
              if (closed) return;
              try {
                controller.enqueue(
                  encoder.encode(
                    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
                  )
                );
              } catch {
                closed = true;
              }
            };

            const poll = async () => {
              if (closed) return;

              try {
                const [currentLobby] = await db
                  .select()
                  .from(lobbies)
                  .where(eq(lobbies.code, code));

                if (!currentLobby) {
                  send("error", { message: "Lobby introuvable" });
                  closed = true;
                  controller.close();
                  return;
                }

                const lobbyPlayers = await db
                  .select({
                    id: players.id,
                    name: players.name,
                    isHost: players.isHost,
                  })
                  .from(players)
                  .where(
                    and(
                      eq(players.lobbyId, currentLobby.id),
                      isNull(players.kickedAt)
                    )
                  );

                const payload = { lobby: currentLobby, players: lobbyPlayers };
                const hash = JSON.stringify(payload);
                if (hash !== lastHash) {
                  lastHash = hash;
                  send("lobby", payload);
                }
              } catch {
                // silently continue on transient DB errors
              }

              if (!closed) {
                setTimeout(poll, 1500);
              }
            };

            send("connected", { ok: true });
            await poll();
          },
          cancel() {
            closed = true;
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
