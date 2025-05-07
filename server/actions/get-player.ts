"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getPlayer(id: number) {
    try {
        const player = await db.query.players.findFirst({
            where: (player) => eq(player.id, id),
        });

        if (!player) throw new Error("Player not found")

        return { success: player } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get player" };
    }
}