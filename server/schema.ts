import { integer, pgTable, serial, timestamp, varchar, real, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nickname: varchar("nickname", { length: 100 }),
    team: varchar("team", { length: 255 }),
    //teamId: integer("team_id").references(() => team.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    imgUrl: varchar("img_url", { length: 500 }),
    userid: varchar("user_id", { length: 255 }),
    userEmail: varchar("user_email", { length: 255 }),
    bio: varchar("bio", { length: 1000 }),
    dartsUsed: varchar("darts_used", { length: 255 }),
    dartsWeight: real("darts_weight"),
    dateOfBirth: timestamp("date_of_birth"),
    // App-wide league administrator. Set directly in the DB for now (no UI).
    // Grants full access across all teams in the permission helpers.
    isLeagueAdmin: boolean("is_league_admin").default(false).notNull(),
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
    gameId: integer("game_id").references(() => games.id, { onDelete: "set null" }),
    roundNo: integer("round_no"),
    roundLeg: integer("round_leg"),
    teamId: integer("team_id").references(() => team.id, { onDelete: "set null" }),
  });

  export const fixtures = pgTable("fixtures", {
    id: serial("id").primaryKey(),
    homeTeam: varchar("home_team", { length: 255 }).notNull(),
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    awayTeam: varchar("away_team", { length: 255 }).notNull(),
    awayTeamId: integer("away_team_id").references(() => team.id, { onDelete: "set null" }),
    homeTeamId: integer("home_team_id").references(() => team.id, { onDelete: "set null" }),
    matchDate: timestamp("match_date").notNull(),
    matchLocation: varchar("match_location", { length: 255 }).notNull(),
    matchLocationId: integer("match_location_id").references(() => locations.id, { onDelete: "set null" }),
    league: varchar("league", { length: 255 }).notNull(),
    season: varchar("season", { length: 255 }).notNull(),
    seasonsId: integer("seasons_id").references(() => seasons.id, { onDelete: "set null" }),
    matchStatus: varchar("match_status", { length: 255 }).notNull(),
    // @deprecated — use homeTeamId/awayTeamId + activeTeamId to derive win/loss dynamically. Remove once multi-team is fully live.
    isAppTeamWin: boolean("is_app_team_win").default(false).notNull(),
    notes: varchar("notes", { length: 1055 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  export const games = pgTable("games", {
    id: serial("id").primaryKey(),
    fixtureId: integer("fixture_id").notNull().references(() => fixtures.id, { onDelete: "cascade" }),
    homeTeamScore: integer("home_team_score").default(0).notNull(),
    awayTeamScore: integer("away_team_score").default(0).notNull(),
    gameType: varchar("game_type", { length: 255 }).notNull(),
    // @deprecated — derive from fixture homeTeamId/awayTeamId + activeTeamId. Remove once multi-team is fully live.
    isAppTeamWin: boolean("is_app_team_win").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  export const rounds = pgTable("rounds", {
    id: serial("id").primaryKey(),
    roundNumber: integer("round_number").default(1).notNull(),
    leg: integer("leg").default(1).notNull(),
    gameId: integer("game_id").notNull().references(() => games.id, {
      onDelete: "cascade"
    }),
    playerId: integer("player_id").notNull().references(() => players.id, {
      onDelete: "cascade"
    }),
    homeScore: integer("home_score").default(0).notNull(),
    awayScore: integer("away_score").default(0).notNull(),
    dartsUsed: integer("darts_used").default(3).notNull(),
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

    export const team = pgTable("team", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    createdAt: timestamp("created_at").defaultNow(),
    defaultLocationId: integer("default_location_id").references(() => locations.id, { onDelete: "set null" }),
    // @deprecated — replaced by player_teams + activeTeamId context. Remove once multi-team is fully live.
    isAppTeam: boolean("is_app_team").default(false).notNull(),
    finesEnabled: boolean("fines_enabled").default(true).notNull(),
    logoUrl: varchar("logo_url", { length: 500 }),
    instagramUrl: varchar("instagram_url", { length: 500 }),
  });

export const teamPhotos = pgTable("team_photos", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamSponsors = pgTable("team_sponsors", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamPhotosRelations = relations(teamPhotos, ({ one }) => ({
  team: one(team, { fields: [teamPhotos.teamId], references: [team.id] }),
}));

export const teamSponsorsRelations = relations(teamSponsors, ({ one }) => ({
  team: one(team, { fields: [teamSponsors.teamId], references: [team.id] }),
}));

// Player ↔ Team membership (one player can belong to multiple teams)
export const playerTeams = pgTable("player_teams", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  teamId: integer("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(false).notNull(),
  // Role on this team. One of:
  //   "player"        — view/issue fines + edit own profile only
  //   "vice_captain"  — same access as player
  //   "treasurer"     — player + manage fines & payment records
  //   "secretary"     — team admin (fixtures/fines/players) but cannot edit other profiles
  //   "captain"       — full team management incl. roles, edit/delete others
  role: varchar("role", { length: 20 }).default("player").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerTeamsRelations = relations(playerTeams, ({ one }) => ({
  player: one(players, { fields: [playerTeams.playerId], references: [players.id] }),
  team: one(team, { fields: [playerTeams.teamId], references: [team.id] }),
}));

// Player requests to join a team — captain/secretary approves or rejects.
// Players never self-add to a team; membership is created on approval.
export const teamJoinRequests = pgTable("team_join_requests", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  teamId: integer("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  // "pending" | "approved" | "rejected"
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedByPlayerId: integer("resolved_by_player_id").references(() => players.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at"),
});

export const teamJoinRequestsRelations = relations(teamJoinRequests, ({ one }) => ({
  player: one(players, { fields: [teamJoinRequests.playerId], references: [players.id] }),
  team: one(team, { fields: [teamJoinRequests.teamId], references: [team.id] }),
}));


  export const locations = pgTable("locations", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: varchar("address", { length: 500 }),
    googleMapsLink: varchar("google_maps_link", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
  });
  

export const attendance = pgTable("attendance", {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    fixtureId: integer("fixture_id").notNull().references(() => fixtures.id, { onDelete: "cascade" }),
    attending: boolean("attending"), // null = pending, true = yes, false = no
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

export const attendanceRelations = relations(attendance, ({ one }) => ({
    player: one(players, {
      fields: [attendance.playerId],
      references: [players.id],
    }),
    fixture: one(fixtures, {
      fields: [attendance.fixtureId],
      references: [fixtures.id],
    }),
  }));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    player: one(players, {
      fields: [subscriptions.playerId],
      references: [players.id],
    }),
  }));

  export const paymentsRelations = relations(payments, ({ one }) => ({
    player: one(players, {
      fields: [payments.playerId],
      references: [players.id],
    }),
  }));

  export const seasons = pgTable("seasons", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });


  /*
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

  export const appSettings = pgTable("app_settings", {
    id: serial("id").primaryKey(),
    maxTeamGamesPerMatch: integer("max_team_games_per_match").default(1).notNull(),
    maxDoublesGamesPerMatch: integer("max_doubles_games_per_match").default(2).notNull(),
    maxSinglesGamesPerMatch: integer("max_singles_games_per_match").default(4).notNull(),
    maxLegsPerGame: integer("max_legs_per_game").default(3).notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  export const playersRelations = relations(players, ({ many }) => ({
    playerFines: many(playerFines),
    playerAwards: many(playerAwards),
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

export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerAwards = pgTable("player_awards", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  awardId: integer("award_id").notNull().references(() => awards.id, { onDelete: "cascade" }),
  seasonId: integer("season_id").references(() => seasons.id, { onDelete: "set null" }),
  notes: varchar("notes", { length: 500 }),
  awardedAt: timestamp("awarded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const awardsRelations = relations(awards, ({ many }) => ({
  playerAwards: many(playerAwards),
}));

export const playerAwardsRelations = relations(playerAwards, ({ one }) => ({
  player: one(players, {
    fields: [playerAwards.playerId],
    references: [players.id],
  }),
  award: one(awards, {
    fields: [playerAwards.awardId],
    references: [awards.id],
  }),
  season: one(seasons, {
    fields: [playerAwards.seasonId],
    references: [seasons.id],
  }),
}));

// ── Practice mode ──────────────────────────────────────────────────────────

export const practiceGames = pgTable("practice_games", {
  id: serial("id").primaryKey(),
  gameType: varchar("game_type", { length: 50 }).notNull(),
  legs: integer("legs").default(3).notNull(),
  status: varchar("status", { length: 50 }).default("in_progress").notNull(),
  gameMode: varchar("game_mode", { length: 20 }).default("singles").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const practicePlayers = pgTable("practice_players", {
  id: serial("id").primaryKey(),
  practiceGameId: integer("practice_game_id").notNull().references(() => practiceGames.id, { onDelete: "cascade" }),
  playerId: integer("player_id").references(() => players.id, { onDelete: "set null" }),
  guestName: varchar("guest_name", { length: 255 }),
  orderIndex: integer("order_index").notNull(),
  legsWon: integer("legs_won").default(0).notNull(),
  team: varchar("team", { length: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practiceRounds = pgTable("practice_rounds", {
  id: serial("id").primaryKey(),
  practiceGameId: integer("practice_game_id").notNull().references(() => practiceGames.id, { onDelete: "cascade" }),
  practicePlyrId: integer("practice_plyr_id").notNull().references(() => practicePlayers.id, { onDelete: "cascade" }),
  leg: integer("leg").default(1).notNull(),
  throwNumber: integer("throw_number").notNull(),
  score: integer("score").notNull(),
  remainingScore: integer("remaining_score").notNull(),
  dartsUsed: integer("darts_used").default(3).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practiceGamesRelations = relations(practiceGames, ({ many }) => ({
  players: many(practicePlayers),
  rounds: many(practiceRounds),
}));

export const practicePlayersRelations = relations(practicePlayers, ({ one, many }) => ({
  game: one(practiceGames, { fields: [practicePlayers.practiceGameId], references: [practiceGames.id] }),
  player: one(players, { fields: [practicePlayers.playerId], references: [players.id] }),
  rounds: many(practiceRounds),
}));

export const practiceRoundsRelations = relations(practiceRounds, ({ one }) => ({
  game: one(practiceGames, { fields: [practiceRounds.practiceGameId], references: [practiceGames.id] }),
  practicePlayer: one(practicePlayers, { fields: [practiceRounds.practicePlyrId], references: [practicePlayers.id] }),
}));