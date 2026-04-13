"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { fixtures, games, team } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const deleteGame = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {

        const game = await db.query.games.findFirst({
          where: eq(games.id, id),
        });

        if (!game) return { error: "Game not found" };

        await db.delete(games).where(eq(games.id, id));

        // Recalculate fixture score after deletion
        const fixtureId = game.fixtureId;
        const fixture = await db.query.fixtures.findFirst({ where: eq(fixtures.id, fixtureId) });
        if (fixture) {
          const allGames = await db.query.games.findMany({ where: eq(games.fixtureId, fixtureId) });
          const homeWins = allGames.filter(g => g.homeTeamScore > g.awayTeamScore).length;
          const awayWins = allGames.filter(g => g.awayTeamScore > g.homeTeamScore).length;
          const homeTeam = fixture.homeTeamId
            ? await db.query.team.findFirst({ where: eq(team.id, fixture.homeTeamId) })
            : null;
          const awayTeam = fixture.awayTeamId
            ? await db.query.team.findFirst({ where: eq(team.id, fixture.awayTeamId) })
            : null;
          const isAppTeamWin =
            (homeTeam?.isAppTeam === true && homeWins > awayWins) ||
            (awayTeam?.isAppTeam === true && awayWins > homeWins);
          await db
            .update(fixtures)
            .set({ homeTeamScore: homeWins, awayTeamScore: awayWins, isAppTeamWin, updatedAt: new Date() })
            .where(eq(fixtures.id, fixtureId));
        }

        revalidatePath("/fixtures/" + fixtureId);
        return { success: `game has been deleted` }
      } catch (error) {
        return { error: `Failed to delete player. ${JSON.stringify(error)}` }
      }
    }
  )