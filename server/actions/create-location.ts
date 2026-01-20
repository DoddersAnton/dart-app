"use server";
import { addLocationSchema } from "@/types/add-location-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { locations } from "../schema";
import { revalidatePath } from "next/cache";



const actionClient = createSafeActionClient();

export const createLocation = actionClient
.schema(addLocationSchema)
.action(async ({ parsedInput: { id, name, address, googleMapsLink
 } }) => {
    try {
      

    if(id) {

        const existingLocation = await db.query.locations.findFirst({
          where: eq(locations.id, id),
        });

        if (!existingLocation) return { error: "Location not found" };

        await db
          .update(locations)
          .set({
            name: name ?? undefined,
            address: address ?? undefined,
            googleMapsLink: googleMapsLink ?? undefined,
            createdAt: existingLocation.createdAt
          })
          .where(id ? eq(locations.id, id) : undefined)
          .returning();

        revalidatePath("/settings/locations");
        return { success: `Location ${existingLocation.name} has been updated` };
      }


      await db
      .insert(locations)
      .values({
        name: name ?? undefined,
            address: address ?? undefined,
            googleMapsLink: googleMapsLink ?? undefined,
            createdAt: new Date()
            
      })
      .returning();

         revalidatePath("/settings/locations");
        return { success: `Location ${name} has been created` };
      
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);