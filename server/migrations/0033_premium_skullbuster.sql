ALTER TABLE "games" ADD COLUMN "sequence" integer;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "home_darts_at_double" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "away_darts_at_double" integer DEFAULT 0 NOT NULL;