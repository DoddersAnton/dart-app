"use server";

import { createMulitplePlayerFineSchema } from "@/types/add-mulitple-fines.schema";
import { currentUser } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { fines, playerFines, players } from "../schema";
import { revalidatePath } from "next/cache";


const actionClient = createSafeActionClient();


export const createMulitplePlayerFines = actionClient
  .schema(createMulitplePlayerFineSchema)
  .action(
    async ({ parsedInput: { playerIds, fineId, matchDate, notes } }) => {
      try {
        const user = await currentUser();

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

            await db
                .insert(playerFines)
                .values({
                matchDate: matchDate ? new Date(matchDate) : undefined,
                playerId: playerId,
                fineId: fineId,
                notes: notes,
                issuedBy: user?.id,
                })
                .returning();
        }

       

        revalidatePath("/fines/add-mulitple-fines");
        return { success: `${playerIds.length} Fine(s) has been created` };
      } catch (error) {
        console.error(error);
        return { error: JSON.stringify(error) };
      }
    }
  );
