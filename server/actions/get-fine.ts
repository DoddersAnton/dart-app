"use server"

import { eq } from "drizzle-orm";
import { db } from ".."

export async function getFine(id: number) {
    try {
        const fine = await db.query.fines.findFirst({
            where: (fines) => eq(fines.id, id),
        });

        if (!fine) throw new Error("Fine not found")

        return { success: fine } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fine" };
    }
}