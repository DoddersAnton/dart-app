"use server"

import { db } from ".."

export async function getTeams() {
    try {
        const teamList = await db.query.team.findMany();
        return teamList.map((team) => ({
            id: team.id,
            name: team.name
        }));
    } catch (error) {
        console.error(error);
        return { error: "Failed to get teams" };
    }
}