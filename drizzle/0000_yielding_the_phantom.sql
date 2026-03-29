CREATE TYPE "public"."lobby_status" AS ENUM('waiting', 'roles_assigned', 'in_progress', 'finished');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('aventurier', 'imposteur');--> statement-breakpoint
CREATE TABLE "lobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(6) NOT NULL,
	"host_id" uuid,
	"status" "lobby_status" DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lobbies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lobby_id" uuid NOT NULL,
	"name" varchar(30) NOT NULL,
	"role" "role",
	"is_host" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE cascade ON UPDATE no action;