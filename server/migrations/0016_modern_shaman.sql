ALTER TABLE "practice_games" ADD COLUMN "game_mode" varchar(20) DEFAULT 'singles' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_players" ADD COLUMN "team" varchar(1);