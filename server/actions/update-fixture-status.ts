"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { db } from "..";
import { fixtures } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

export const updateFixtureStatus = actionClient
  .schema(z.object({ id: z.number().int().positive(), status: z.string() }))
  .action(async ({ parsedInput: { id, status } }) => {
    try {
      await db
        .update(fixtures)
        .set({ matchStatus: status, updatedAt: new Date() })
        .where(eq(fixtures.id, id));

      revalidatePath(`/fixtures/${id}`);
      revalidatePath("/fixtures");
      return { success: `Match status updated to ${status}` };
    } catch (error) {
      return { error: JSON.stringify(error) };
    }
  });
