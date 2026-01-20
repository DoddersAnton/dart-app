
'use server';
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { team } from "../schema";
import { revalidatePath } from "next/cache";
import { addTeamSchema } from "@/types/add-team-schema";



const actionClient = createSafeActionClient();

export const createTeam = actionClient
.schema(addTeamSchema)
.action(async ({ parsedInput: { id, name, defaultLocationId, isAppTeam
 } }) => {
    try {
      

    if(id) {

        const existingTeam = await db.query.team.findFirst({
          where: eq(team.id, id),
        });

        if (!existingTeam) return { error: "team not found" };

        await db
          .update(team)
          .set({
            name: name ?? undefined,
            defaultLocationId: defaultLocationId ?? undefined,
            isAppTeam: isAppTeam ?? undefined,
            createdAt: existingTeam.createdAt,
            
          })
          .where(id ? eq(team.id, id) : undefined)
          .returning();

        revalidatePath("/settings/teams");
        return { success: `Team ${existingTeam.name} has been updated` };
      }


      await db
      .insert(team)
      .values({
        name: name ?? undefined,
            defaultLocationId: defaultLocationId ?? undefined,
            isAppTeam: isAppTeam ?? undefined,
            createdAt: new Date()
            
      })
      .returning();

         revalidatePath("/settings/teams");
        return { success: `Team ${name} has been created` };
      
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);