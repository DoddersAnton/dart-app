"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { players } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";

const actionClient = createSafeActionClient();

export const linkPlayerUser = actionClient
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    const { userId } = await auth();
    if (!userId) return { error: "Not authenticated" };

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? null;

    try {
      await db
        .update(players)
        .set({ userid: userId, userEmail: email })
        .where(eq(players.id, id));

      revalidatePath("/player/" + id);
      return { success: "Player linked to your account" };
    } catch (error) {
      return { error: `Failed to link player. ${JSON.stringify(error)}` };
    }
  });
