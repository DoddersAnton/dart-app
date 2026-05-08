"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { db } from "..";
import { games, rounds, fixtures, team, appSettings } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

export const deleteGameRounds = actionClient
  .schema(z.object({ gameId: z.number() }))
  .action(async ({ parsedInput: { gameId } }) => {
    try {
      const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });
      if (!game) return { error: "Game not found" };

      await db.delete(rounds).where(eq(rounds.gameId, gameId));

      await db.update(games).set({ homeTeamScore: 0, awayTeamScore: 0, updatedAt: new Date() }).where(eq(games.id, gameId));

      // Recalculate fixture score
      const fixture = await db.query.fixtures.findFirst({ where: eq(fixtures.id, game.fixtureId) });
      if (fixture) {
        const settings = await db.query.appSettings.findFirst();
        const legsToWin = Math.ceil((settings?.maxLegsPerGame ?? 3) / 2);
        const allGames = await db.query.games.findMany({ where: eq(games.fixtureId, game.fixtureId) });
        const homeWins = allGames.filter((g) => g.homeTeamScore >= legsToWin).length;
        const awayWins = allGames.filter((g) => g.awayTeamScore >= legsToWin).length;
        const homeTeamRecord = fixture.homeTeamId
          ? await db.query.team.findFirst({ where: eq(team.id, fixture.homeTeamId) })
          : null;
        const awayTeamRecord = fixture.awayTeamId
          ? await db.query.team.findFirst({ where: eq(team.id, fixture.awayTeamId) })
          : null;
        const isAppTeamWin =
          (homeTeamRecord?.isAppTeam === true && homeWins > awayWins) ||
          (awayTeamRecord?.isAppTeam === true && awayWins > homeWins);
        await db
          .update(fixtures)
          .set({ homeTeamScore: homeWins, awayTeamScore: awayWins, isAppTeamWin, updatedAt: new Date() })
          .where(eq(fixtures.id, game.fixtureId));
      }

      revalidatePath(`/games/${gameId}`);
      revalidatePath(`/fixtures/${game.fixtureId}`);
      return { success: "Rounds deleted" };
    } catch (error) {
      return { error: `Failed to delete rounds. ${JSON.stringify(error)}` };
    }
  });
