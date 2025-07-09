CREATE TABLE "game_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_home_team_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_away_team_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_type" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "home_team_player_id";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "away_team_player_id";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "match_type";