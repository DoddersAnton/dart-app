"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getPlayerSubscriptions(id: number) {
    try {
        const subs = await db.query.subscriptions.findFirst({
            where: (sub) => eq(sub.playerId, id),
        });

        if (!subs) throw new Error("Subscriptions not found")

        return { success: subs } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get Subscriptions" };
    }
}