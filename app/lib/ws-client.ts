import { useEffect, useRef, useCallback } from "react";
import { getLobby } from "@/server/functions/lobby";
import { useLobbyStore } from "@/stores/lobby-store";

const POLL_INTERVAL = 2000;

export function useLobbyPolling(lobbyCode: string) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const activeRef = useRef(true);

  const poll = useCallback(async () => {
    if (!activeRef.current || !lobbyCode) return;

    try {
      const result = await getLobby({ data: lobbyCode });
      if (!activeRef.current) return;

      const { setLobby, setPlayers, setError, setRolesAssigned } =
        useLobbyStore.getState();
      setLobby(result.lobby);
      setPlayers(result.players);
      setError(null);

      if (result.lobby.status === "roles_assigned") {
        setRolesAssigned(true);
      }
    } catch (err: any) {
      if (activeRef.current) {
        useLobbyStore.getState().setError(err.message ?? "Erreur de connexion");
      }
    }
  }, [lobbyCode]);

  useEffect(() => {
    if (!lobbyCode) return;

    activeRef.current = true;
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      activeRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lobbyCode, poll]);

  return { connected: true };
}
