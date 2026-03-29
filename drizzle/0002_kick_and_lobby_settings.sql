ALTER TABLE "lobbies" ADD COLUMN "impostor_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "kicked_at" timestamp;