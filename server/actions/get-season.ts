"use server"


import { eq } from "drizzle-orm";
import { db } from ".."

export async function getSeason(id: number) {
    try {
        const season = await db.query.seasons.findFirst({
            where: (season) => eq(season.id, id),
        });

       
       return {success: season };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get seasons" };
    }
}