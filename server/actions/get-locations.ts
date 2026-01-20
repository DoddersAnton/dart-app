

"use server"


import { db } from ".."

export async function getLocations() {
    try {
        const locations  = await db.query.locations.findMany();

       
       

        return { success: locations };


    } catch (error) {
        console.error(error);
        return { error: "Failed to get locations" };
    }
}