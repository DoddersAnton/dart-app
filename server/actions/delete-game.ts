"use server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { games } from "../schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "..";



const actionClient = createSafeActionClient();

export const deleteGame = actionClient
    .schema(z.object({ id: z.number() }))
    .action(async ({ parsedInput: { id } }) => {
      try {

        const game = await db.query.games.findFirst({
          where: eq(games.id, id),
        });

        if (!game) return { error: "Game not found" };

        await db
          .delete(games)
          .where(eq(games.id, id))
          .returning()
        revalidatePath("/fixtures/" + game.fixtureId)

        return { success: `game has been deleted` }
      } catch (error) {
        return { error: `Failed to delete player. ${JSON.stringify(error)}` }
      }
    }
  )