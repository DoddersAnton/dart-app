"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { fixtures, team } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Update a fixture's week number / scores / status / division from the schedule view.
export async function updateFixtureSchedule(params: {
  fixtureId: number;
  weekNo?: number | null;
  homeTeamScore?: number;
  awayTeamScore?: number;
  matchStatus?: string;
  divisionId?: number | null;
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireLeagueAdmin();

    const fx = await db.query.fixtures.findFirst({ where: eq(fixtures.id, params.fixtureId) });
    if (!fx) return { error: "Fixture not found" };

    const set: Partial<typeof fixtures.$inferInsert> = { updatedAt: new Date() };
    if (params.weekNo !== undefined) set.weekNo = params.weekNo;
    if (params.matchStatus !== undefined) set.matchStatus = params.matchStatus;
    if (params.divisionId !== undefined) set.divisionId = params.divisionId ?? null;
    if (params.homeTeamScore !== undefined) set.homeTeamScore = params.homeTeamScore;
    if (params.awayTeamScore !== undefined) set.awayTeamScore = params.awayTeamScore;

    // Recompute the legacy app-team-win flag when scores change.
    if (params.homeTeamScore !== undefined || params.awayTeamScore !== undefined) {
      const hs = params.homeTeamScore ?? fx.homeTeamScore;
      const as = params.awayTeamScore ?? fx.awayTeamScore;
      const [homeTeam, awayTeam] = await Promise.all([
        fx.homeTeamId ? db.query.team.findFirst({ where: eq(team.id, fx.homeTeamId) }) : Promise.resolve(null),
        fx.awayTeamId ? db.query.team.findFirst({ where: eq(team.id, fx.awayTeamId) }) : Promise.resolve(null),
      ]);
      set.isAppTeamWin = Boolean((homeTeam?.isAppTeam && hs > as) || (awayTeam?.isAppTeam && as > hs));
    }

    await db.update(fixtures).set(set).where(eq(fixtures.id, params.fixtureId));

    revalidatePath(`/fixtures/schedule/${fx.seasonsId}`);
    revalidatePath("/fixtures");
    return { success: "Fixture updated" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
    console.error("updateFixtureSchedule error:", error);
    return { error: "Failed to update fixture" };
  }
}
