"use server"

import { db } from ".."

export async function getPlayers() {
    try {
        const playersList = await db.query.players.findMany();
        return playersList.map((player) => ({
            id: player.id,
            name: player.name,
            nickname: player.nickname,
            team: player.team,
            createdAt: player.createdAt ? player.createdAt.toISOString() : null,
        }));
    } catch (error) {
        console.error(error);
        return { error: "Failed to get players" };
    }
}