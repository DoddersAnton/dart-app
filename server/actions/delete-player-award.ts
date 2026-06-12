"use server";
import { requireCaptain } from "@/lib/permissions";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { playerAwards } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";

const actionClient = createSafeActionClient();

export const deletePlayerAward = actionClient
  .schema(z.object({ id: z.number(), playerId: z.number() }))
  .action(async ({ parsedInput: { id, playerId } }) => {
    try {
      await db.delete(playerAwards).where(eq(playerAwards.id, id)).returning();
      revalidatePath(`/player/${playerId}/awards`);
      return { success: "Award has been removed from player" };
    } catch (error) {
      return { error: `Failed to remove award. ${JSON.stringify(error)}` };
    }
  });
