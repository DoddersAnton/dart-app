"use server";

import { createSafeActionClient } from "next-safe-action";
import { and, eq, inArray, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { fixtures, gamePlayers, games, singlesDraws } from "../schema";
import { singlesDrawSchema } from "@/types/singles-draw-schema";

const actionClient = createSafeActionClient();

// A claim older than this with no Singles games behind it is stale (e.g. the drawn
// games were deleted) and may be taken over. Younger claims may be a draw in flight.
const STALE_CLAIM_MS = 30_000;

// Creates one 0-0 Singles game per drawn pairing, in draw order, with each
// game's roster set to the two drawn players.
export const createSinglesDraw = actionClient
  .schema(singlesDrawSchema)
  .action(async ({ parsedInput: { fixtureId, matches } }) => {
    try {
      const fixture = await db.query.fixtures.findFirst({ where: eq(fixtures.id, fixtureId) });
      if (!fixture) return { error: "Fixture not found" };

      let claim = await db
        .insert(singlesDraws)
        .values({ fixtureId })
        .onConflictDoNothing()
        .returning({ fixtureId: singlesDraws.fixtureId });

      if (claim.length === 0) {
        // Claimed before — only take it over if no Singles games remain and the
        // claim isn't a concurrent draw in progress. The conditional UPDATE is
        // atomic, so only one caller can win the takeover.
        const singlesRemain = await db.query.games.findFirst({
          where: and(eq(games.fixtureId, fixtureId), eq(games.gameType, "Singles")),
        });
        if (!singlesRemain) {
          claim = await db
            .update(singlesDraws)
            .set({ createdAt: new Date() })
            .where(and(
              eq(singlesDraws.fixtureId, fixtureId),
              lt(singlesDraws.createdAt, new Date(Date.now() - STALE_CLAIM_MS)),
            ))
            .returning({ fixtureId: singlesDraws.fixtureId });
        }
        if (claim.length === 0) return { error: "This fixture already has singles games" };
      }

      let gameIds: number[];
      try {
        const existingSingles = await db.query.games.findFirst({
          where: and(eq(games.fixtureId, fixtureId), eq(games.gameType, "Singles")),
        });
        if (existingSingles) {
          await db.delete(singlesDraws).where(eq(singlesDraws.fixtureId, fixtureId));
          return { error: "This fixture already has singles games" };
        }

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

        gameIds = created.map((g) => g.id).sort((a, b) => a - b);

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
      } catch (error) {
        await db.delete(singlesDraws).where(eq(singlesDraws.fixtureId, fixtureId));
        throw error;
      }

      revalidatePath(`/fixtures/${fixtureId}`);
      return { success: `${gameIds.length} singles games created`, gameIds };
    } catch (error) {
      console.error("createSinglesDraw error:", error);
      return { error: "Failed to create singles games" };
    }
  });
