ALTER TABLE "rounds" ALTER COLUMN "player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game_players" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "game_players" ADD COLUMN "side" varchar(4);--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "home_player_id" integer;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "away_player_id" integer;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "home_darts_used" integer;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "away_darts_used" integer;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_home_player_id_players_id_fk" FOREIGN KEY ("home_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_away_player_id_players_id_fk" FOREIGN KEY ("away_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;