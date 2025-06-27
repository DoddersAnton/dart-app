"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { payments, playerFines } from "../schema";
import { addPaymentSchema } from "@/types/add-payment-schema";

const actionClient = createSafeActionClient();

export const createPayment = actionClient
.schema(addPaymentSchema)
.action(async ({ parsedInput: {playerId, amount, paymentMethod, paymentType, paymentStatus, transactionId, fineList, subList } }) => {
    try {
      if (!playerId || !amount || !paymentMethod) {
        return { error: "Player ID, amount, and payment method are required" };
      }

      if(fineList && fineList.length === 0) {
        return { error: "No fines selected for payment" };
      }

      // Make sure to import the correct payments table at the top: import { payments } from "../schema";
      const newPayment = await db
        .insert(payments)
        .values({
          playerId,
          amount,
          paymentMethod,
          paymentType,
          paymentStatus,
          transactionId: transactionId ?? null,
          createdAt: new Date(),
        })
        .returning();

        for (const fineId of fineList) {
            //update fine to paid status

            console.log("Updating fine with ID:", fineId);

            await db
              .update(playerFines)
              .set({
                status: "Paid",
              })
              .where(eq(playerFines.id, fineId))
              .returning();
        }

        const player = await db.query.players.findFirst({
          where: (p, { eq }) => eq(p.id, playerId),
        }); 

        for (const subId of subList) {
            //update sub to paid status
            console.log("Updating sub with ID:", subId);

            await db
              .update(playerFines)
              .set({
                status: "Paid",
              })
              .where(eq(playerFines.id, subId))
              .returning();
        }

      revalidatePath("/players/" + playerId);
      return { success: `Payment of £${amount.toFixed(2)} for ${player?.name ?? "player"} has been created`, data: newPayment };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
 
);
