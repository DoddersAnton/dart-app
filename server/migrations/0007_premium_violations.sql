CREATE TABLE "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_number" integer DEFAULT 1 NOT NULL,
	"leg" integer DEFAULT 1 NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"fine_added" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "payment_id" integer;--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "game_id" integer;--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "round_no" integer;--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "round_leg" integer;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_fines" ADD CONSTRAINT "player_fines_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_fines" ADD CONSTRAINT "player_fines_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;