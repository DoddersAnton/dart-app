"use server";
import { requireCaptain } from "@/lib/permissions";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { awards } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";

const actionClient = createSafeActionClient();

export const deleteAward = actionClient
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      await db.delete(awards).where(eq(awards.id, id)).returning();
      revalidatePath("/settings/award-types");
      return { success: "Award type has been deleted" };
    } catch (error) {
      return { error: `Failed to delete award type. ${JSON.stringify(error)}` };
    }
  });
