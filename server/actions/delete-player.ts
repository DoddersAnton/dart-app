"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { players } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const deletePlayer = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {
        await db
          .delete(players)
          .where(eq(players.id, id))
          .returning()
        revalidatePath("/players")

        return { success: `player has been deleted` }
      } catch (error) {
        return { error: `Failed to delete player. ${JSON.stringify(error)}` }
      }
    }
  )