"use server"


import { eq } from "drizzle-orm";
import { db } from ".."

export async function getTeam(id: number) {
    try {
        const team = await db.query.team.findFirst({
            where: (team) => eq(team.id, id),
        });

       
       return { success: team } ;

    } catch (error) {
        console.error(error);
        return { error: "Failed to get seasons" };
    }
}