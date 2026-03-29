import { create } from "zustand";

const PLAYER_ID_KEY = "who-impostor-player-id";

function persistPlayerId(id: string) {
  try {
    sessionStorage.setItem(PLAYER_ID_KEY, id);
  } catch { }
}

function restorePlayerId(): string | null {
  try {
    return sessionStorage.getItem(PLAYER_ID_KEY);
  } catch {
    return null;
  }
}

function clearPlayerId() {
  try {
    sessionStorage.removeItem(PLAYER_ID_KEY);
  } catch { }
}

export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export interface LobbyState {
  lobby: {
    id: string;
    code: string;
    status: string;
    hostId: string | null;
    impostorCount: number;
  } | null;
  players: LobbyPlayer[];
  myPlayerId: string | null;
  myRole: string | null;
  rolesAssigned: boolean;
  error: string | null;

  setLobby: (lobby: LobbyState["lobby"]) => void;
  setPlayers: (players: LobbyPlayer[]) => void;
  addPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: string) => void;
  setMyPlayerId: (id: string) => void;
  setMyRole: (role: string) => void;
  setRolesAssigned: (assigned: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  lobby: null,
  players: [],
  myPlayerId: restorePlayerId(),
  myRole: null,
  rolesAssigned: false,
  error: null,
};

export const useLobbyStore = create<LobbyState>((set) => ({
  ...initialState,

  setLobby: (lobby) => set({ lobby }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.id === player.id)
        ? state.players
        : [...state.players, player],
    })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  setMyPlayerId: (id) => {
    persistPlayerId(id);
    set({ myPlayerId: id });
  },
  setMyRole: (role) => set({ myRole: role }),
  setRolesAssigned: (assigned) => set({ rolesAssigned: assigned }),
  setError: (error) => set({ error }),
  reset: () => {
    clearPlayerId();
    set({ ...initialState, myPlayerId: null });
  },
}));
