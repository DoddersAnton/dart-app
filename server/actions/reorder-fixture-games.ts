"use server";

import { createSafeActionClient } from "next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "..";
import { games } from "../schema";

const actionClient = createSafeActionClient();

// Saves the play order of a fixture's games: gameIds[0] plays first.
export const reorderFixtureGames = actionClient
  .schema(z.object({ fixtureId: z.number().int().positive(), gameIds: z.array(z.number().int().positive()).min(1) }))
  .action(async ({ parsedInput: { fixtureId, gameIds } }) => {
    try {
      const owned = await db
        .select({ id: games.id })
        .from(games)
        .where(and(eq(games.fixtureId, fixtureId), inArray(games.id, gameIds)));
      if (owned.length !== gameIds.length) return { error: "Some games don't belong to this fixture" };

      await Promise.all(
        gameIds.map((id, i) => db.update(games).set({ sequence: i + 1 }).where(eq(games.id, id)))
      );

      revalidatePath(`/fixtures/${fixtureId}`);
      return { success: "Game order saved" };
    } catch (error) {
      console.error("reorderFixtureGames error:", error);
      return { error: "Failed to save game order" };
    }
  });
