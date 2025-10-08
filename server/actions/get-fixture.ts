"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getFixture(id: number) {
    try {
        const fixture = await db.query.fixtures.findFirst({
            where: (fixture) => eq(fixture.id, id),
        });

        if (!fixture) throw new Error(`Fixture not found ${id}`);

        return { success: fixture } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture" };
    }
}