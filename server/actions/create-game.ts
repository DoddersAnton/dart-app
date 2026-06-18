"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appSettings, fixtures, gamePlayers, games } from "../schema";
import { addGameSchema } from "@/types/add-game-schema";

async function recalculateFixtureScore(fixtureId: number) {
  const fixture = await db.query.fixtures.findFirst({ where: eq(fixtures.id, fixtureId) });
  if (!fixture) return;

  const settings = await db.query.appSettings.findFirst();
  const maxLegsPerGame = settings?.maxLegsPerGame ?? 3;
  const legsToWin = Math.ceil(maxLegsPerGame / 2);

  const allGames = await db.query.games.findMany({ where: eq(games.fixtureId, fixtureId) });

  const homeWins = allGames.filter(g => g.homeTeamScore >= legsToWin).length;
  const awayWins = allGames.filter(g => g.awayTeamScore >= legsToWin).length;

  await db
    .update(fixtures)
    // isAppTeamWin is deprecated — win/loss is derived dynamically from team ids + active team.
    .set({ homeTeamScore: homeWins, awayTeamScore: awayWins, isAppTeamWin: false, updatedAt: new Date() })
    .where(eq(fixtures.id, fixtureId));
}

const actionClient = createSafeActionClient();

export const createGame = actionClient
.schema(addGameSchema)
.action(async ({ parsedInput: { id, homeTeamScore, awayTeamScore, gameType, homePlayerList, awayPlayerList, fixtureId
 } }) => {
    try {

        const fixture = await db.query.fixtures.findFirst({
                 where: eq(fixtures.id, fixtureId ?? 0 ),
               });

          if (!fixture) {
            return { error: "Fixture not found for the game" };
          }

          const homeTeamId = fixture.homeTeamId;
          const awayTeamId = fixture.awayTeamId;

    // Roster rows stamped with the team they represent + denormalised side.
    const rosterRows = (gameId: number) => [
      ...homePlayerList.map((playerId) => ({ gameId, playerId, teamId: homeTeamId, side: "home" as const })),
      ...awayPlayerList.map((playerId) => ({ gameId, playerId, teamId: awayTeamId, side: "away" as const })),
    ];

    if(id) {

        const existingGame = await db.query.games.findFirst({
          where: eq(games.id, id),
        });

        if (!existingGame) return { error: "Game not found" };

        await db
          .update(games)
          .set({
            homeTeamScore: homeTeamScore ?? 0,
            awayTeamScore: awayTeamScore ?? 0,
            gameType: gameType ?? existingGame.gameType,
            fixtureId: fixtureId ?? existingGame.fixtureId,
            isAppTeamWin: false, // deprecated — derived downstream
            createdAt: existingGame.createdAt ?? new Date(),

          })
          .where(id ? eq(games.id, id) : undefined)
          .returning();

        // Replace the roster
        const rows = rosterRows(id);
        await db.delete(gamePlayers).where(eq(gamePlayers.gameId, id));
        if (rows.length > 0) await db.insert(gamePlayers).values(rows);

        await recalculateFixtureScore(fixtureId as number);
        revalidatePath(`/fixtures/${fixtureId}`);
        return { success: `Game has been updated` };
      }

      const newGame = await db
      .insert(games)
      .values({
        homeTeamScore: homeTeamScore ?? 0,
        awayTeamScore: awayTeamScore ?? 0,
        gameType: gameType ?? "(unknown)", // Default to Friendly if not provided
        fixtureId: fixtureId as number, // Ensure fixtureId is a number and not undefined
        isAppTeamWin: false, // deprecated — derived downstream
        createdAt: new Date(),
      })
      .returning();

        const rows = rosterRows(newGame[0].id);
        if (rows.length > 0) await db.insert(gamePlayers).values(rows);

        await recalculateFixtureScore(fixtureId as number);
        revalidatePath(`/fixtures/${fixtureId}`);

     return { success: `Game has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
