CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"fixture_id" integer NOT NULL,
	"attending" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "user_email" varchar(255);--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_email_unique" UNIQUE("user_email");