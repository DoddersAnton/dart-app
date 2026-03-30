"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { attendance } from "../schema";

const actionClient = createSafeActionClient();

export const updateAvailability = actionClient
  .schema(
    z.object({
      playerId: z.number(),
      fixtureId: z.number(),
      attending: z.boolean(),
      note: z.string().max(500).optional(),
    })
  )
  .action(async ({ parsedInput: { playerId, fixtureId, attending, note } }) => {
    await db
      .update(attendance)
      .set({ attending, note: note ?? null, updatedAt: new Date() })
      .where(
        and(eq(attendance.playerId, playerId), eq(attendance.fixtureId, fixtureId))
      );

    revalidatePath(`/player/${playerId}/availability`);
    return { success: true };
  });
