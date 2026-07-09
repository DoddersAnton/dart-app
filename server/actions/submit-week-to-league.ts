"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { fixtures } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { writeWeekStandings, type TeamStanding } from "../league-standings";

const actionClient = createSafeActionClient();

const schema = z.object({
  seasonId: z.number(),
  divisionId: z.number().nullable(),
  weekNo: z.number(),
});

export const submitWeekToLeague = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { seasonId, divisionId, weekNo } }) => {
    try {
      await requireLeagueAdmin();

      const divCond = divisionId == null ? isNull(fixtures.divisionId) : eq(fixtures.divisionId, divisionId);

      // Every fixture belonging to (season, division) — used to build the full team set.
      const allDivisionFixtures = await db.query.fixtures.findMany({
        where: and(eq(fixtures.seasonsId, seasonId), divCond),
      });

      const weekFixtures = allDivisionFixtures.filter((f) => f.weekNo === weekNo);
      if (weekFixtures.length === 0) {
        return { error: "No fixtures found for this week." };
      }
      const unfinished = weekFixtures.filter((f) => f.matchStatus !== "completed");
      if (unfinished.length > 0) {
        return { error: `All games must be completed first — ${unfinished.length} still open.` };
      }

      // Cumulative standings: every completed fixture up to and including this week.
      const countedFixtures = allDivisionFixtures.filter(
        (f) => f.matchStatus === "completed" && f.weekNo != null && f.weekNo <= weekNo,
      );

      // Seed every team that has any fixture in the division so the table is complete.
      const accums = new Map<number, TeamStanding>();
      const seed = (teamId: number | null) => {
        if (teamId == null || accums.has(teamId)) return;
        accums.set(teamId, { teamId, played: 0, wins: 0, draws: 0, losses: 0, legsFor: 0, legsAgainst: 0 });
      };
      for (const f of allDivisionFixtures) { seed(f.homeTeamId); seed(f.awayTeamId); }

      const applySide = (teamId: number | null, forLegs: number, againstLegs: number) => {
        if (teamId == null) return;
        const a = accums.get(teamId)!;
        a.played += 1;
        a.legsFor += forLegs;
        a.legsAgainst += againstLegs;
        if (forLegs > againstLegs) a.wins += 1;
        else if (forLegs < againstLegs) a.losses += 1;
        else a.draws += 1;
      };
      for (const f of countedFixtures) {
        applySide(f.homeTeamId, f.homeTeamScore, f.awayTeamScore);
        applySide(f.awayTeamId, f.awayTeamScore, f.homeTeamScore);
      }

      await writeWeekStandings(seasonId, divisionId, weekNo, [...accums.values()]);

      revalidatePath("/fixtures/league-table");
      revalidatePath(`/fixtures/schedule/${seasonId}`);
      return { success: `Week ${weekNo} submitted to the league table.` };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
      console.error("submitWeekToLeague error:", error);
      return { error: "Failed to submit week to the league." };
    }
  });
