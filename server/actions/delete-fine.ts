"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { fines } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";
import { requireFinanceAccess } from "@/lib/permissions";



const actionClient = createSafeActionClient();

export const deleteFine = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {
        await requireFinanceAccess();
        await db
          .delete(fines)
          .where(eq(fines.id, id))
          .returning()
        revalidatePath("/fines/fine-types")

        return { success: `Fine type has been deleted` }
      } catch (error) {
        return { error: `Failed to delete fine type. ${JSON.stringify(error)}` }
      }
    }
  )