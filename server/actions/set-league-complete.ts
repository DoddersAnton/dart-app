"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { leagueStatus } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";

const actionClient = createSafeActionClient();

const schema = z.object({
  seasonId: z.number(),
  divisionId: z.number().nullable(),
  complete: z.boolean(),
});

export const setLeagueComplete = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { seasonId, divisionId, complete } }) => {
    try {
      await requireLeagueAdmin();

      const divCond = divisionId == null ? isNull(leagueStatus.divisionId) : eq(leagueStatus.divisionId, divisionId);
      const existing = await db.query.leagueStatus.findFirst({
        where: and(eq(leagueStatus.seasonsId, seasonId), divCond),
      });

      const now = new Date();
      if (existing) {
        await db.update(leagueStatus)
          .set({ completedAt: complete ? now : null, updatedAt: now })
          .where(eq(leagueStatus.id, existing.id));
      } else {
        await db.insert(leagueStatus).values({
          seasonsId: seasonId,
          divisionId: divisionId ?? undefined,
          completedAt: complete ? now : null,
          createdAt: now,
          updatedAt: now,
        });
      }

      revalidatePath("/fixtures/league-table");
      return { success: complete ? "League marked complete — final positions locked." : "League reopened." };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
      console.error("setLeagueComplete error:", error);
      return { error: "Failed to update league status." };
    }
  });
