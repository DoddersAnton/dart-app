CREATE TABLE "team_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"url" varchar(500) NOT NULL,
	"caption" varchar(255),
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"website_url" varchar(500),
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "description" varchar(1000);--> statement-breakpoint
ALTER TABLE "team_photos" ADD CONSTRAINT "team_photos_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_sponsors" ADD CONSTRAINT "team_sponsors_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;