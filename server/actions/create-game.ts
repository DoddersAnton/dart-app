"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appSettings, fixtures, gamePlayers, games, team } from "../schema";
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

const actionClient = createSafeActionClient();

export const createGame = actionClient
.schema(addGameSchema)
.action(async ({ parsedInput: { id, homeTeamScore, awayTeamScore, gameType, playerList, fixtureId
 } }) => {
    try {

        const fixture = await db.query.fixtures.findFirst({
                 where: eq(fixtures.id, fixtureId ?? 0 ),
               });
    
          if (!fixture) {
            return { error: "Fixture not found for the game" };
          }
    
          const awayTeamId = fixture.awayTeamId;
          const homeTeamId = fixture.homeTeamId;  

         const awayTeam = await db.query.team.findFirst({
                where: eq(team.id, awayTeamId ?? 0),
              });
        
              if(!awayTeam) {
                return { error: "Away Team not found" };
              }
        
              const homeTeam = await db.query.team.findFirst({
                where: eq(team.id, homeTeamId ?? 0),
              }); 
        
              if(!homeTeam) {
                return { error: "Home Team not found" };
              }
      

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
            isAppTeamWin: 
                (awayTeam.isAppTeam && awayTeamScore! > homeTeamScore!) ||
                (homeTeam.isAppTeam && homeTeamScore! > awayTeamScore!),
            createdAt: existingGame.createdAt ?? new Date(),
            
          })
          .where(id ? eq(games.id, id) : undefined)
          .returning();

        // Update player list if provided
        if (playerList && playerList.length > 0) {
            await db.delete(gamePlayers).where(eq(gamePlayers.gameId, id));
            const playerValues = playerList.map(playerId => ({
                gameId: id,
                playerId: playerId,
            }));
            await db.insert(gamePlayers).values(playerValues);
        }

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
         isAppTeamWin: 
                (awayTeam.isAppTeam && awayTeamScore! > homeTeamScore!) ||
                (homeTeam.isAppTeam && homeTeamScore! > awayTeamScore!),
        createdAt: new Date(),
      })
      .returning();

        if (playerList && playerList.length > 0) {
            
            const playerValues = playerList.map(playerId => ({
                gameId: newGame[0].id,
                playerId: playerId,
            }));
            await db.insert(gamePlayers).values(playerValues);
        }

        await recalculateFixtureScore(fixtureId as number);
        revalidatePath(`/fixtures/${fixtureId}`);

     return { success: `Game has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
