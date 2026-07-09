CREATE TABLE "league_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"seasons_id" integer NOT NULL,
	"division_id" integer,
	"week_no" integer NOT NULL,
	"team_id" integer NOT NULL,
	"played" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"legs_for" integer DEFAULT 0 NOT NULL,
	"legs_against" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "league_table" ADD CONSTRAINT "league_table_seasons_id_seasons_id_fk" FOREIGN KEY ("seasons_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_table" ADD CONSTRAINT "league_table_division_id_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_table" ADD CONSTRAINT "league_table_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;