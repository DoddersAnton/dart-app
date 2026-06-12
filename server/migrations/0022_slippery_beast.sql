CREATE TABLE "team_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"note" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"resolved_by_player_id" integer,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "is_league_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_resolved_by_player_id_players_id_fk" FOREIGN KEY ("resolved_by_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;