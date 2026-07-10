CREATE TABLE "league_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"seasons_id" integer NOT NULL,
	"division_id" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "league_status" ADD CONSTRAINT "league_status_seasons_id_seasons_id_fk" FOREIGN KEY ("seasons_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_status" ADD CONSTRAINT "league_status_division_id_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE cascade ON UPDATE no action;