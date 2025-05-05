"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getPlayerFine(id: number) {
    try {
        const playerFine = await db.query.playerFines.findFirst({
            where: (fines) => eq(fines.id, id),
        });

        if (!playerFine) throw new Error("Event not found")

        return { success: playerFine } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get player fine" };
    }
}