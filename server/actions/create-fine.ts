"use server";
import { createSafeActionClient } from "next-safe-action";
import { createFineSchema } from "@/types/add-fine-type-schema";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fines } from "../schema";

const actionClient = createSafeActionClient();

export const createFine = actionClient
.schema(createFineSchema)
.action(async ({ parsedInput: { id, title, amount, description  } }) => {
    try {
      

    if(id) {

        const existingFine = await db.query.fines.findFirst({
          where: eq(fines.id, id),
        });

        if (!existingFine) return { error: "Fine not found" };

        await db
          .update(fines)
          .set({
            title: title ? "": undefined,
            description: description ? "": undefined,
            amount: amount ?? 0,
            createdAt: existingFine.createdAt
          })
          .where(id ? eq(fines.id, id) : undefined)
          .returning();

        revalidatePath("/fines/fine-types/add-fine-type");
        return { success: `Fine ${existingFine.title} has been updated` };
      }

      await db
      .insert(fines)
      .values({
        title: title ?? "(No Title)",
        description: description ? "": undefined,
        amount: amount ?? 0,
        createdAt: new Date()
      })
      .returning();

      revalidatePath("/fines/fine-types/add-fine-type");
    return { success: `Fine ${title} has been inserted` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
