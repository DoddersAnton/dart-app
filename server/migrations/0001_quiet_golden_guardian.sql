CREATE TABLE "fixtures" (
	"id" serial PRIMARY KEY NOT NULL,
	"home_team" varchar(255) NOT NULL,
	"home_team_score" integer DEFAULT 0 NOT NULL,
	"away_team_score" integer DEFAULT 0 NOT NULL,
	"away_team" varchar(255) NOT NULL,
	"match_date" timestamp NOT NULL,
	"match_time" timestamp NOT NULL,
	"match_location" varchar(255) NOT NULL,
	"league" varchar(255) NOT NULL,
	"season" varchar(255) NOT NULL,
	"match_status" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"fixture_id" integer NOT NULL,
	"home_team_player_id" integer NOT NULL,
	"away_team_player_id" integer NOT NULL,
	"home_team_score" integer DEFAULT 0 NOT NULL,
	"away_team_score" integer DEFAULT 0 NOT NULL,
	"match_type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "player_fines" ADD COLUMN "status" varchar(50) DEFAULT 'Unpaid';--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_player_id_players_id_fk" FOREIGN KEY ("home_team_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_player_id_players_id_fk" FOREIGN KEY ("away_team_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;