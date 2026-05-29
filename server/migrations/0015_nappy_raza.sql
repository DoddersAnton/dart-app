ALTER TABLE "players" ADD COLUMN "bio" varchar(1000);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "darts_used" varchar(255);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "darts_weight" real;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "date_of_birth" timestamp;