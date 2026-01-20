
'use server';

import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import {  seasons } from "../schema";
import { revalidatePath } from "next/cache";
import { addSeasonSchema } from "@/types/add-season-schema";



const actionClient = createSafeActionClient();

export const createSeason = actionClient
.schema(addSeasonSchema)
.action(async ({ parsedInput: { id, name, startDate, endDate
 } }) => {
    try {
      

    if(id) {

        const existingSeason = await db.query.seasons.findFirst({
          where: eq(seasons.id, id),
        });

        if (!existingSeason) return { error: "Season not found" };

        await db
          .update(seasons)
          .set({
            name: name ?? undefined,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            createdAt: existingSeason.createdAt
            
          })
          .where(id ? eq(seasons.id, id) : undefined)
          .returning();

        revalidatePath("/settings/seasons");
        return { success: `Season ${existingSeason.name} has been updated` };
      }


      await db
      .insert(seasons)
      .values({
       name: name ?? undefined,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            createdAt: new Date()
            
      })
      .returning();

         revalidatePath("/settings/seasons");
        return { success: `Season ${name} has been created` };
      
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);