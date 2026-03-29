import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const lobbyStatusEnum = pgEnum("lobby_status", [
  "waiting",
  "roles_assigned",
  "in_progress",
  "finished",
]);

export const roleEnum = pgEnum("role", ["aventurier", "imposteur"]);

export const lobbies = pgTable("lobbies", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(),
  hostId: uuid("host_id"),
  status: lobbyStatusEnum("status").default("waiting").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  lobbyId: uuid("lobby_id")
    .references(() => lobbies.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 30 }).notNull(),
  role: roleEnum("role"),
  isHost: boolean("is_host").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  hasSeenRole: boolean("has_seen_role").default(false).notNull(),
});

export type Lobby = typeof lobbies.$inferSelect;
export type NewLobby = typeof lobbies.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
