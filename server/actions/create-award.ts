"use server";
import { requireCaptain } from "@/lib/permissions";
import { createSafeActionClient } from "next-safe-action";
import { createAwardSchema } from "@/types/add-award-schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { awards } from "../schema";

const actionClient = createSafeActionClient();

export const createAward = actionClient
  .schema(createAwardSchema)
  .action(async ({ parsedInput: { id, title, description } }) => {
    try {
      if (id) {
        const existing = await db.query.awards.findFirst({ where: eq(awards.id, id) });
        if (!existing) return { error: "Award not found" };

        await db
          .update(awards)
          .set({ title, description: description ?? undefined })
          .where(eq(awards.id, id))
          .returning();

        revalidatePath("/settings/award-types");
        return { success: `Award "${title}" has been updated` };
      }

      await db
        .insert(awards)
        .values({ title, description: description ?? undefined, createdAt: new Date() })
        .returning();

      revalidatePath("/settings/award-types");
      return { success: `Award "${title}" has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  });
