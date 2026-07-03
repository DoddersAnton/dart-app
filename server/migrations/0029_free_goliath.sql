CREATE TABLE "division" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "division_id" integer;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_division_id_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE set null ON UPDATE no action;