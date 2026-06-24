"use server";

import { createMulitplePlayerFineSchema } from "@/types/add-mulitple-fines.schema";
import { currentUser } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { fines, playerFines, players } from "../schema";
import { revalidatePath } from "next/cache";
import { resolveSeasonIdForDate } from "../season-helper";


const actionClient = createSafeActionClient();


export const createMulitplePlayerFines = actionClient
  .schema(createMulitplePlayerFineSchema)
  .action(
    async ({ parsedInput: { playerIds, fineId, matchDate, notes, quantity, teamId, seasonId } }) => {
      try {
        const user = await currentUser();

        // Use the chosen season, otherwise derive it from the fine's match date.
        const resolvedSeasonId = seasonId ?? (await resolveSeasonIdForDate(matchDate ? new Date(matchDate) : null));

        for (const playerId of playerIds) {
          const player = await db.query.players.findFirst({
            where: eq(players.id, playerId),
          });

          if (!player) return { error: "Player not found" };

            if (fineId) {
            const fine = await db.query.fines.findFirst({
                where: eq(fines.id, fineId),
            });

            if (!fine) return { error: "Fine not found" };
            }

            if(quantity > 1)
            {
              for(let i = 0; i < quantity; i++){
                await db
                  .insert(playerFines)
                  .values({
                    matchDate: matchDate ? new Date(matchDate) : undefined,
                    playerId: playerId,
                    fineId: fineId,
                    notes: notes,
                    issuedBy: user?.id,
                    teamId: teamId ?? null,
                    seasonId: resolvedSeasonId,
                  })
                  .returning();

              }
             
            }else {
              await db
                .insert(playerFines)
                .values({
                  matchDate: matchDate ? new Date(matchDate) : undefined,
                  playerId: playerId,
                  fineId: fineId,
                  notes: notes,
                  issuedBy: user?.id,
                  teamId: teamId ?? null,
                  seasonId: resolvedSeasonId,
                })
                .returning();
              }
           
        }

       

        revalidatePath("/fines/add-mulitple-fines");
        return { success: `${quantity} fines(s) created for ${playerIds.length} player(s).` };
      } catch (error) {
        console.error(error);
        return { error: JSON.stringify(error) };
      }
    }
  );
