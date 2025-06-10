CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"amount" real DEFAULT 0 NOT NULL,
	"payment_method" varchar(255) NOT NULL,
	"payment_type" varchar(50) DEFAULT 'One-time' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"transaction_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;