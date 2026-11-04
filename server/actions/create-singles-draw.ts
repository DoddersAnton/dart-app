"use server";

import { createSafeActionClient } from "next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { fixtures, gamePlayers, games } from "../schema";
import { singlesDrawSchema } from "@/types/singles-draw-schema";

const actionClient = createSafeActionClient();

// Creates one 0-0 Singles game per drawn pairing, in draw order, with each
// game's roster set to the two drawn players.
export const createSinglesDraw = actionClient
  .schema(singlesDrawSchema)
  .action(async ({ parsedInput: { fixtureId, matches } }) => {
    try {
      const fixture = await db.query.fixtures.findFirst({ where: eq(fixtures.id, fixtureId) });
      if (!fixture) return { error: "Fixture not found" };

      // Guard against a double apply (e.g. two scorers drawing at once).
      const existingSingles = await db.query.games.findFirst({
        where: and(eq(games.fixtureId, fixtureId), eq(games.gameType, "Singles")),
      });
      if (existingSingles) return { error: "This fixture already has singles games" };

      const created = await db
        .insert(games)
        .values(
          matches.map(() => ({
            fixtureId,
            gameType: "Singles",
            homeTeamScore: 0,
            awayTeamScore: 0,
            isAppTeamWin: false, // deprecated — derived downstream
            createdAt: new Date(),
          }))
        )
        .returning({ id: games.id });

      const gameIds = created.map((g) => g.id).sort((a, b) => a - b);

      const rosterRows = matches.flatMap((m, i) => [
        ...(m.homePlayerId
          ? [{ gameId: gameIds[i], playerId: m.homePlayerId, teamId: fixture.homeTeamId, side: "home" as const }]
          : []),
        ...(m.awayPlayerId
          ? [{ gameId: gameIds[i], playerId: m.awayPlayerId, teamId: fixture.awayTeamId, side: "away" as const }]
          : []),
      ]);

      try {
        await db.insert(gamePlayers).values(rosterRows);
      } catch (error) {
        // No transactions on neon-http — undo the games so a retry starts clean.
        await db.delete(games).where(inArray(games.id, gameIds));
        throw error;
      }

      revalidatePath(`/fixtures/${fixtureId}`);
      return { success: `${gameIds.length} singles games created`, gameIds };
    } catch (error) {
      console.error("createSinglesDraw error:", error);
      return { error: "Failed to create singles games" };
    }
  });
