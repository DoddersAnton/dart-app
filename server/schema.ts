import { integer, pgTable, serial, timestamp, varchar,  real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nickname: varchar("nickname", { length: 100 }),
    team: varchar("team", { length: 255 }),
    teamId: integer("team_id").references(() => team.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  });

  export const fines = pgTable("fines", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    amount: real("amount").default(0.00).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });

  export const playerFines = pgTable("player_fines", {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    fineId: integer("fine_id").notNull().references(() => fines.id, { onDelete: "cascade" }),
    matchDate: timestamp("match_date"),
    notes: varchar("notes", { length: 1055 }),
    issuedBy: varchar("issued_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    status: varchar("status", { length: 50 }).default("Unpaid"),
  });

  export const fixtures = pgTable("fixtures", {
    id: serial("id").primaryKey(),
    homeTeam: varchar("home_team", { length: 255 }).notNull(),
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    awayTeam: varchar("away_team", { length: 255 }).notNull(),
    matchDate: timestamp("match_date").notNull(),
    matchTime: timestamp("match_time").notNull(),
    matchLocation: varchar("match_location", { length: 255 }).notNull(),
    league: varchar("league", { length: 255 }).notNull(),
    season: varchar("season", { length: 255 }).notNull(),
  
    matchStatus: varchar("match_status", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  export const games = pgTable("games", {
    id: serial("id").primaryKey(),
    fixtureId: integer("fixture_id").notNull().references(() => fixtures.id, { onDelete: "cascade" }),
    homeTeamPlayerId: integer("home_team_player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    awayTeamPlayerId: integer("away_team_player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    matchType: varchar("match_type", { length: 255 }).notNull()
  });

  


  
  export const team = pgTable("team", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });

  export const playersTeamRelations = relations(players, ({ one }) => ({
    team: one(team, {
      fields: [players.teamId],
      references: [team.id],
    }),
  }));
  

  export const teamRelations = relations(team, ({ many }) => ({
    players: many(players),
  }));

  export const playersRelations = relations(players, ({ many }) => ({
    playerFines: many(playerFines),
  }));

  export const finesRelations = relations(fines, ({ many }) => ({
    playerFines: many(playerFines),
  }));

  export const playerFinesRelations = relations(playerFines, ({ one }) => ({
    player: one(players, {
      fields: [playerFines.playerId],
      references: [players.id],
    }),
    fine: one(fines, {
      fields: [playerFines.fineId],
      references: [fines.id],
    }),
  }));