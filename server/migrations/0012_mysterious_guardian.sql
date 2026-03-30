ALTER TABLE "attendance" ALTER COLUMN "attending" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "note" varchar(500);