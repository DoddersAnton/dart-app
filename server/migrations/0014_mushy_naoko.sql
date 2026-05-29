CREATE TABLE "awards" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_awards" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"award_id" integer NOT NULL,
	"season_id" integer,
	"notes" varchar(500),
	"awarded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_type" varchar(50) NOT NULL,
	"legs" integer DEFAULT 3 NOT NULL,
	"status" varchar(50) DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "practice_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"practice_game_id" integer NOT NULL,
	"player_id" integer,
	"guest_name" varchar(255),
	"order_index" integer NOT NULL,
	"legs_won" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"practice_game_id" integer NOT NULL,
	"practice_plyr_id" integer NOT NULL,
	"leg" integer DEFAULT 1 NOT NULL,
	"throw_number" integer NOT NULL,
	"score" integer NOT NULL,
	"remaining_score" integer NOT NULL,
	"darts_used" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "player_awards" ADD CONSTRAINT "player_awards_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_awards" ADD CONSTRAINT "player_awards_award_id_awards_id_fk" FOREIGN KEY ("award_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_awards" ADD CONSTRAINT "player_awards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_players" ADD CONSTRAINT "practice_players_practice_game_id_practice_games_id_fk" FOREIGN KEY ("practice_game_id") REFERENCES "public"."practice_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_players" ADD CONSTRAINT "practice_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_rounds" ADD CONSTRAINT "practice_rounds_practice_game_id_practice_games_id_fk" FOREIGN KEY ("practice_game_id") REFERENCES "public"."practice_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_rounds" ADD CONSTRAINT "practice_rounds_practice_plyr_id_practice_players_id_fk" FOREIGN KEY ("practice_plyr_id") REFERENCES "public"."practice_players"("id") ON DELETE cascade ON UPDATE no action;