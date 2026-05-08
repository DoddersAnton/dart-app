CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"max_team_games_per_match" integer DEFAULT 1 NOT NULL,
	"max_doubles_games_per_match" integer DEFAULT 2 NOT NULL,
	"max_singles_games_per_match" integer DEFAULT 4 NOT NULL,
	"max_legs_per_game" integer DEFAULT 3 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "notes" varchar(1055);--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "darts_used" integer DEFAULT 3 NOT NULL;