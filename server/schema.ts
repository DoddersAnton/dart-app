import { integer, pgTable, serial, timestamp, varchar,  real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nickname: varchar("nickname", { length: 100 }),
    team: varchar("team", { length: 255 }),
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
  });

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