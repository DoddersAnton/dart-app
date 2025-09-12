"use server";
import { createSafeActionClient } from "next-safe-action";
import { createRoundFineSchema } from "@/types/add-fine-schema";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { players, fines, playerFines } from "../schema";

const actionClient = createSafeActionClient();

export const createPlayerRoundFine = actionClient
  .schema(createRoundFineSchema)
  .action(
    async ({ parsedInput: { id, playerId, fineId, matchDate, notes, quantity, gameId, roundNo, roundLeg } }) => {
      try {
        const user = await currentUser();

        if (playerId) {
          const player = await db.query.players.findFirst({
            where: eq(players.id, playerId),
          });

          if (!player) return { error: "Player not found" };
        }

        if (fineId) {
          const fine = await db.query.fines.findFirst({
            where: eq(fines.id, fineId),
          });

          if (!fine) return { error: "Fine not found" };
        }

        if(gameId) {
          const game = await db.query.games.findFirst({
            where: eq(players.id, gameId),
          }); 
          if (!game) return { error: "Game not found" };
        }

        console.log("===ID===", id);

        if (id) {
          await db
            .update(playerFines)
            .set({
              matchDate: matchDate ? new Date(matchDate) : undefined,
              playerId: playerId,
              fineId: fineId,
              notes: notes,
              issuedBy: user?.id,
              gameId: gameId,
              roundNo: roundNo,
              roundLeg: roundLeg,
            })
            .where(id ? eq(playerFines.id, id) : undefined)
            .returning();

          return { success: `Fine has been updated` };
        }

        if(quantity > 1){
          for(let i = 0; i < quantity; i++){
            await db
              .insert(playerFines)
              .values({
                matchDate: matchDate ? new Date(matchDate) : undefined,
                playerId: playerId,
                fineId: fineId,
                notes: notes,
                issuedBy: user?.id,
                gameId: gameId,
                roundNo: roundNo,
                roundLeg: roundLeg,
              })
              .returning();
          }
          return { success: `${quantity} Fine(s) have been created` };
        }

        await db
          .insert(playerFines)
          .values({
            matchDate: matchDate ? new Date(matchDate) : undefined,
            playerId: playerId,
            fineId: fineId,
            notes: notes,
            issuedBy: user?.id,
            gameId: gameId,
            roundNo: roundNo,
            roundLeg: roundLeg,
          })
          .returning();

        return { success: `Fine has been created` };
      } catch (error) {
        console.error(error);
        return { error: JSON.stringify(error) };
      }
    }
  );
