"use server";
import { requireTeamAdmin } from "@/lib/permissions";
import { createSafeActionClient } from "next-safe-action";
import { createPlayerAwardSchema } from "@/types/add-player-award-schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { playerAwards } from "../schema";

const actionClient = createSafeActionClient();

export const createPlayerAward = actionClient
  .schema(createPlayerAwardSchema)
  .action(async ({ parsedInput: { id, playerId, awardId, seasonId, notes, awardedAt } }) => {
    try {
      const awardedDate = awardedAt ? new Date(awardedAt) : new Date();

      if (id) {
        const existing = await db.query.playerAwards.findFirst({ where: eq(playerAwards.id, id) });
        if (!existing) return { error: "Player award not found" };

        await db
          .update(playerAwards)
          .set({
            awardId,
            seasonId: seasonId ?? null,
            notes: notes ?? null,
            awardedAt: awardedDate,
          })
          .where(eq(playerAwards.id, id))
          .returning();

        revalidatePath(`/player/${playerId}/awards`);
        return { success: "Player award has been updated" };
      }

      await db
        .insert(playerAwards)
        .values({
          playerId,
          awardId,
          seasonId: seasonId ?? null,
          notes: notes ?? null,
          awardedAt: awardedDate,
          createdAt: new Date(),
        })
        .returning();

      revalidatePath(`/player/${playerId}/awards`);
      return { success: "Award has been assigned to player" };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  });
