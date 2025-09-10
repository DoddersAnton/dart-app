import { integer, pgTable, serial, timestamp, varchar,  real, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nickname: varchar("nickname", { length: 100 }),
    team: varchar("team", { length: 255 }),
    //teamId: integer("team_id").references(() => team.id, { onDelete: "cascade" }),
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
    paymentId: integer("payment_id").references(() => payments.id, { onDelete: "set null" }),
    roundId: integer("round_id").references(() => rounds.id, { onDelete: "set null" }),
  });

  export const fixtures = pgTable("fixtures", {
    id: serial("id").primaryKey(),
    homeTeam: varchar("home_team", { length: 255 }).notNull(),
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    awayTeam: varchar("away_team", { length: 255 }).notNull(),
    matchDate: timestamp("match_date").notNull(),
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
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    gameType: varchar("game_type", { length: 255 }).notNull()
  });

  export const rounds = pgTable("rounds", {
    id: serial("id").primaryKey(),
    roundNumber: integer("round_number").default(1).notNull(),
    gameId: integer("game_id").notNull().references(() => games.id, {
      onDelete: "cascade"
    }),
    playerId: integer("player_id").notNull().references(() => players.id, {
      onDelete: "cascade"
    }),
    homeScore: integer("home_score").default(0).notNull(),
    awayScore: integer("away_score").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    fineAdded: boolean("fine_added").default(false).notNull(),
  });

  export const gamePlayers = pgTable("game_players", {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id, {
      onDelete: "cascade"
    }),
    playerId: integer("player_id").notNull().references(() => players.id, {
      onDelete: "cascade"
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),  
    playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    amount: real("amount").default(0.00).notNull(),
    paymentMethod: varchar("payment_method", { length: 255 }).notNull(),
    paymentType: varchar("payment_type", { length: 50 }).default("One-time").notNull(),
    paymentStatus: varchar("payment_status", { length: 50 }).default("Pending").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  });

 export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    subscriptionType: varchar("subscription_type", { length: 255 }).notNull(),
    season: varchar("season", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    amount: real("amount").default(0.00).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: varchar("status", { length: 50 }).default("Active").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });
  


  /*
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
  */

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