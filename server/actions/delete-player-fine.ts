"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { playerFines } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const deletePlayerfine = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {
        const data = await db
          .delete(playerFines)
          .where(eq(playerFines.id, id))
          .returning()
        revalidatePath("/fines")

        return { success: `fine ${data[0].notes} has been deleted` }
      } catch (error) {
        return { error: `Failed to delete fine. ${JSON.stringify(error)}` }
      }
    }
  )