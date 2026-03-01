"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { players } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const updatePlayerImageUrl = actionClient
    .schema(z.object({ url: z.string(), id: z.number() }))
    .action(async ({ parsedInput: { url, id } }) => {
      try {
        await db
          .update(players)
          .set({ imgUrl: url })
          .where(eq(players.id, id))
          .returning()
        revalidatePath("/player/" + id)

        return { success: `Player Image has been updated` }
      } catch (error) {
        return { error: `Failed to update player image. ${JSON.stringify(error)}` }
      }
    }
  )