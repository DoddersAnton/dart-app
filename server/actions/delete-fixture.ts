"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { fixtures } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const deleteFixture = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {

        const fixture = await db.query.fixtures.findFirst({
          where: eq(fixtures.id, id),
        });

        if (!fixture) return { error: "Fixture not found" };

        await db
          .delete(fixtures)
          .where(eq(fixtures.id, id))
          .returning()
        revalidatePath("/fixtures/")

        return { success: `fixture has been deleted` }
      } catch (error) {
        return { error: `Failed to delete fixture. ${JSON.stringify(error)}` }
      }
    }
  )