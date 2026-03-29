import { useEffect, useRef, useCallback, useState } from "react";
import { getLobby } from "@/server/functions/lobby";
import { useLobbyStore } from "@/stores/lobby-store";
import {
  playJoinSound,
  playLeaveSound,
  playRolesAssignedSound,
} from "@/lib/sound-manager";
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from "@/lib/notifications";

const POLL_INTERVAL = 2000;

export type UseLobbyPollingOptions = {
  onKickedFromLobby?: () => void;
};

function processLobbyData(
  result: { lobby: any; players: any[] },
  onKickedRef: React.RefObject<(() => void) | undefined>,
  prevPlayerCountRef: React.RefObject<number>
) {
  const { setLobby, setPlayers, setError, setRolesAssigned, myPlayerId } =
    useLobbyStore.getState();

  const prevCount = prevPlayerCountRef.current;
  const newCount = result.players.length;

  // Detect player join/leave for sounds
  if (prevCount > 0) {
    if (newCount > prevCount) {
      playJoinSound();
    } else if (newCount < prevCount) {
      playLeaveSound();
    }
  }
  prevPlayerCountRef.current = newCount;

  setLobby(result.lobby);
  setPlayers(result.players);
  setError(null);

  if (result.lobby.status === "roles_assigned") {
    if (!useLobbyStore.getState().rolesAssigned) {
      playRolesAssignedSound();
      sendBrowserNotification(
        "Qui est l'imposteur",
        "Les rôles ont été attribués ! Découvre ton rôle."
      );
    }
    setRolesAssigned(true);
  }

  if (myPlayerId && !result.players.some((p) => p.id === myPlayerId)) {
    onKickedRef.current?.();
  }
}

function useLobbySSE(
  lobbyCode: string,
  options?: UseLobbyPollingOptions
): { connected: boolean; failed: boolean } {
  const [connected, setConnected] = useState(false);
  const [failed, setFailed] = useState(false);
  const onKickedRef = useRef(options?.onKickedFromLobby);
  onKickedRef.current = options?.onKickedFromLobby;
  const prevPlayerCountRef = useRef(0);

  useEffect(() => {
    if (!lobbyCode) return;

    requestNotificationPermission();
    let es: EventSource | null = null;
    let retries = 0;

    const connect = () => {
      es = new EventSource(`/api/lobby/${lobbyCode}/events`);

      es.addEventListener("lobby", (event) => {
        try {
          const data = JSON.parse(event.data);
          processLobbyData(data, onKickedRef, prevPlayerCountRef);
          setConnected(true);
          retries = 0;
        } catch {}
      });

      es.addEventListener("connected", () => {
        setConnected(true);
      });

      es.addEventListener("error", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          if (data?.message) {
            useLobbyStore.getState().setError(data.message);
          }
        } catch {}
      });

      es.onerror = () => {
        es?.close();
        retries++;
        if (retries >= 3) {
          setFailed(true);
          setConnected(false);
        } else {
          setTimeout(connect, 1000 * retries);
        }
      };
    };

    connect();

    return () => {
      es?.close();
    };
  }, [lobbyCode]);

  return { connected, failed };
}

function useLobbyPollingFallback(
  lobbyCode: string,
  enabled: boolean,
  options?: UseLobbyPollingOptions
) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const activeRef = useRef(true);
  const onKickedRef = useRef(options?.onKickedFromLobby);
  onKickedRef.current = options?.onKickedFromLobby;
  const prevPlayerCountRef = useRef(0);

  const poll = useCallback(async () => {
    if (!activeRef.current || !lobbyCode) return;

    try {
      const result = await getLobby({ data: lobbyCode });
      if (!activeRef.current) return;
      processLobbyData(result, onKickedRef, prevPlayerCountRef);
    } catch (err: any) {
      if (activeRef.current) {
        useLobbyStore.getState().setError(err.message ?? "Erreur de connexion");
      }
    }
  }, [lobbyCode]);

  useEffect(() => {
    if (!lobbyCode || !enabled) return;

    activeRef.current = true;
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      activeRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lobbyCode, poll, enabled]);
}

export function useLobbyPolling(
  lobbyCode: string,
  options?: UseLobbyPollingOptions
) {
  const { connected, failed } = useLobbySSE(lobbyCode, options);
  useLobbyPollingFallback(lobbyCode, failed, options);

  return { connected: connected || failed };
}
