"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { db } from "..";
import { appSettings } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

const schema = z.object({
  id: z.number().int().positive(),
  maxTeamGamesPerMatch: z.number().int().min(1).max(10),
  maxDoublesGamesPerMatch: z.number().int().min(1).max(10),
  maxSinglesGamesPerMatch: z.number().int().min(1).max(10),
  maxLegsPerGame: z.number().int().min(1).max(10),
});

export const updateAppSettings = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    try {
      await db
        .update(appSettings)
        .set({
          maxTeamGamesPerMatch: parsedInput.maxTeamGamesPerMatch,
          maxDoublesGamesPerMatch: parsedInput.maxDoublesGamesPerMatch,
          maxSinglesGamesPerMatch: parsedInput.maxSinglesGamesPerMatch,
          maxLegsPerGame: parsedInput.maxLegsPerGame,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.id, parsedInput.id));

      revalidatePath("/settings/app-settings");
      return { success: "Settings saved" };
    } catch (error) {
      return { error: JSON.stringify(error) };
    }
  });
