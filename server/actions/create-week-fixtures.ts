"use server";

import { db } from "..";
import { eq, inArray } from "drizzle-orm";
import { fixtures, team, locations, seasons, playerTeams, attendance } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Bulk-create a week's fixtures (Scheduled). Location = each home team's default;
// availability rows are seeded like the single-fixture create.
export async function createWeekFixtures(params: {
  seasonId: number;
  league: string;
  divisionId?: number | null;
  weekNo: number;
  matchDate: string; // ISO — week default
  pairings: { homeTeamId: number; awayTeamId: number; matchDate?: string }[];
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireLeagueAdmin();

    const season = await db.query.seasons.findFirst({ where: eq(seasons.id, params.seasonId) });
    if (!season) return { error: "Season not found" };

    const pairings = params.pairings.filter((p) => p.homeTeamId && p.awayTeamId);
    if (pairings.length === 0) return { error: "Add at least one complete matchup" };
    for (const p of pairings) {
      if (p.homeTeamId === p.awayTeamId) return { error: "A team can't play itself" };
    }

    const teamIds = [...new Set(pairings.flatMap((p) => [p.homeTeamId, p.awayTeamId]))];
    const teams = await db.query.team.findMany({ where: inArray(team.id, teamIds) });
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const locs = await db.query.locations.findMany();
    const locMap = new Map(locs.map((l) => [l.id, l]));

    const weekDate = new Date(params.matchDate);
    const rows = [];
    for (const p of pairings) {
      const home = teamMap.get(p.homeTeamId);
      const away = teamMap.get(p.awayTeamId);
      if (!home || !away) return { error: "Team not found" };
      const loc = home.defaultLocationId ? locMap.get(home.defaultLocationId) : null;
      if (!loc) return { error: `${home.name} has no default location — set one to schedule their home game.` };
      const matchDate = p.matchDate ? new Date(p.matchDate) : weekDate;
      rows.push({
        homeTeam: home.name,
        homeTeamId: home.id,
        awayTeam: away.name,
        awayTeamId: away.id,
        homeTeamScore: 0,
        awayTeamScore: 0,
        matchLocation: loc.name,
        matchLocationId: loc.id,
        league: params.league?.trim() || "",
        divisionId: params.divisionId ?? null,
        season: season.name,
        seasonsId: season.id,
        weekNo: params.weekNo,
        matchStatus: "scheduled",
        matchDate,
        isAppTeamWin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const inserted = await db.insert(fixtures).values(rows).returning();

    // Availability records are only for the players of the two teams playing each
    // fixture — not the whole league.
    const teamPlayerRows = await db.query.playerTeams.findMany({ where: inArray(playerTeams.teamId, teamIds) });
    const playersByTeam = new Map<number, number[]>();
    for (const tp of teamPlayerRows) {
      const arr = playersByTeam.get(tp.teamId) ?? [];
      arr.push(tp.playerId);
      playersByTeam.set(tp.teamId, arr);
    }
    const attendanceRows = inserted.flatMap((f) => {
      const ids = new Set<number>([
        ...(f.homeTeamId ? playersByTeam.get(f.homeTeamId) ?? [] : []),
        ...(f.awayTeamId ? playersByTeam.get(f.awayTeamId) ?? [] : []),
      ]);
      return [...ids].map((pid) => ({
        playerId: pid,
        fixtureId: f.id,
        attending: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });
    if (attendanceRows.length > 0) {
      await db.insert(attendance).values(attendanceRows);
    }

    revalidatePath(`/fixtures/schedule/${params.seasonId}`);
    revalidatePath("/fixtures");
    return { success: `Created ${rows.length} fixture${rows.length !== 1 ? "s" : ""} for week ${params.weekNo}` };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
    console.error("createWeekFixtures error:", error);
    return { error: "Failed to create fixtures" };
  }
}
