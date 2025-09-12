"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { rounds, games } from "../schema";
import { addGameRoundsSchema } from "@/types/add-game-rounds";

const actionClient = createSafeActionClient();

export const createGameRounds = actionClient
.schema(addGameRoundsSchema)
.action(async ({ parsedInput: {  gameId, gameRounds } }) => {
    try {

      if(!gameId) return { error: "Game ID is required" };

      console.log("===Game ID===", gameId);

    if(gameId) {

        const existingGame = await db.query.games.findFirst({
          where: eq(games.id, gameId),
        });

        if (!existingGame) return { error: "Game not found" };

        for (const round of gameRounds) {
            const { roundNo, roundLeg, homeTeamScore, awayTeamScore, playerId } = round;

            if(!playerId) continue;

            console.log("===Round No===", roundNo);

             await db
             .insert(rounds)
              .values({
                gameId: gameId,
                playerId: playerId,
                roundNumber: roundNo,
                leg: roundLeg,
                homeScore: homeTeamScore ?? 0,
                awayScore: awayTeamScore ?? 0,
              })
              .returning();
        }

    

        return { success: `${gameRounds.length} Game round(s) has been updated` };
      }

 
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
