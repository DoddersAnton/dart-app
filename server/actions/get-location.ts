"use server"


import { eq } from "drizzle-orm";
import { db } from ".."

export async function getLocation(id: number) {
    try {
        const location = await db.query.locations.findFirst({
            where: (location) => eq(location.id, id),
        });

       
       return { success: location};

    } catch (error) {
        console.error(error);
        return { error: "Failed to get location" };
    }
}