ALTER TABLE "team" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "team" CASCADE;--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "home_team_player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "away_team_player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "fixtures" DROP COLUMN "match_time";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "team_id";