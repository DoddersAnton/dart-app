"use server"

import { db } from ".."

export async function getFines() {
    try {
        const playersList = await db.query.fines.findMany();
        return playersList.map((fine) => ({
            id: fine.id,
            name: fine.title,
            description: fine.description,
            amount: fine.amount,
            createdAt: fine.createdAt ? fine.createdAt.toISOString() : null,
        }));
    } catch (error) {
        console.error(error);
        return { error: "Failed to get players" };
    }
}