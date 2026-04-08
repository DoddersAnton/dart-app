"use server";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fixtures } from "../schema";
import { z } from "zod";

const actionClient = createSafeActionClient();

const schema = z.object({
  id: z.number().int().positive(),
  notes: z.string().max(1055).nullable(),
});

export const updateFixtureNotes = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { id, notes } }) => {
    try {
      await db
        .update(fixtures)
        .set({ notes: notes ?? null })
        .where(eq(fixtures.id, id));

      revalidatePath(`/fixtures/${id}`);
      return { success: "Notes saved" };
    } catch (error) {
      return { error: JSON.stringify(error) };
    }
  });
