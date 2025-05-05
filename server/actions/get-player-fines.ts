"use server"

import { db } from ".."

export async function getPlayerFines() {
    try {
        const playersList = await db.query.playerFines.findMany();
        return playersList.map((fine) => ({
            id: fine.id,
            playerId: fine.playerId,
            fineId: fine.fineId,
            matchDate: fine.matchDate ? fine.matchDate.toISOString() : null,
            notes: fine.notes,
            createdAt: fine.createdAt ? fine.createdAt.toISOString() : null,
        }));
    } catch (error) {
        console.error(error);
        return { error: "Failed to get player fine" };
    }
}