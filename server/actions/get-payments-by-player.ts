"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getPaymentsByPlayer(playerId: number) {
    try {
        const payments = await db.query.payments.findFirst({
            where: (payment) => eq(payment.playerId, playerId),
        });

       
        return { success: payments } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get payments" };
    }
}