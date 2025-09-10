"use server";
import { createSafeActionClient } from "next-safe-action";
import { createPlayerFineSchema } from "@/types/add-fine-schema";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { players, fines, playerFines } from "../schema";

const actionClient = createSafeActionClient();

export const createPlayerFine = actionClient
  .schema(createPlayerFineSchema)
  .action(
    async ({ parsedInput: { id, playerId, fineId, matchDate, notes, quantity } }) => {
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
            })
            .where(id ? eq(playerFines.id, id) : undefined)
            .returning();

          revalidatePath("/fines/add-fine");
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
              })
              .returning();
          }
          revalidatePath("/fines/add-fine");
          return { success: `${quantity} Fines have been created` };
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

        revalidatePath("/fines/add-fine");
        return { success: `Fine has been created` };
      } catch (error) {
        console.error(error);
        return { error: JSON.stringify(error) };
      }
    }
  );
