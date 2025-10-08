"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {  gamePlayers, games } from "../schema";
import { addGameSchema } from "@/types/add-game-schema";

const actionClient = createSafeActionClient();

export const createGame = actionClient
.schema(addGameSchema)
.action(async ({ parsedInput: { id, homeTeamScore, awayTeamScore, gameType, playerList, fixtureId
 } }) => {
    try {
      

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

        revalidatePath(`/games/${id}`);
        return { success: `Game has been updated` };
      }

      const newGame = await db
      .insert(games)
      .values({
        homeTeamScore: homeTeamScore ?? 0,
        awayTeamScore: awayTeamScore ?? 0,
        gameType: gameType ?? "(unknown)", // Default to Friendly if not provided
        fixtureId: fixtureId as number, // Ensure fixtureId is a number and not undefined
      })
      .returning();

        if (playerList && playerList.length > 0) {
            
            const playerValues = playerList.map(playerId => ({
                gameId: newGame[0].id,
                playerId: playerId,
            }));
            await db.insert(gamePlayers).values(playerValues);
        }

        revalidatePath(`/games/${id}`);

      // or each play create a subscription to the fixture

     return { success: `Game has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
