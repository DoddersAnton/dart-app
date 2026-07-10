"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireLeagueAdmin } from "@/lib/permissions";
import { writeWeekStandings } from "../league-standings";

const actionClient = createSafeActionClient();

const entrySchema = z.object({
  teamId: z.number(),
  played: z.number().int().min(0),
  wins: z.number().int().min(0),
  draws: z.number().int().min(0),
  losses: z.number().int().min(0),
  legsFor: z.number().int().min(0),
  legsAgainst: z.number().int().min(0),
});

const schema = z.object({
  seasonId: z.number(),
  divisionId: z.number().nullable(),
  weekNo: z.number().int().min(1),
  entries: z.array(entrySchema).min(1),
});

export const submitManualWeek = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { seasonId, divisionId, weekNo, entries } }) => {
    try {
      await requireLeagueAdmin();

      // Guard against the same team being entered twice.
      const teamIds = new Set<number>();
      for (const e of entries) {
        if (teamIds.has(e.teamId)) return { error: "A team appears more than once." };
        teamIds.add(e.teamId);
      }

      await writeWeekStandings(seasonId, divisionId, weekNo, entries);

      revalidatePath("/fixtures/league-table");
      return { success: `Week ${weekNo} standings saved.` };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
      console.error("submitManualWeek error:", error);
      return { error: "Failed to save manual submission." };
    }
  });
