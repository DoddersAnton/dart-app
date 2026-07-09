"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "..";
import { leagueTable, leagueStatus, seasons as seasonsTable, division as divisionTable, team as teamTable } from "../schema";
import { NO_DIVISION, type LeagueRow, type LeagueTableData } from "@/lib/league-table";

export async function getLeagueTableData(
  seasonId?: number | null,
  divisionParam?: number | "none" | null,
): Promise<LeagueTableData> {
  const empty: LeagueTableData = { seasons: [], selectedSeasonId: null, divisions: [], selectedDivisionId: null, weekNo: null, rows: [], isComplete: false };
  try {
    // Seasons that have at least one submitted week.
    const allRows = await db.query.leagueTable.findMany();
    if (allRows.length === 0) return empty;

    const seasonIds = [...new Set(allRows.map((r) => r.seasonsId))];
    const seasonRecords = await db.query.seasons.findMany({
      where: inArray(seasonsTable.id, seasonIds),
      orderBy: (s, { desc }) => [desc(s.startDate)],
    });
    const seasons = seasonRecords.map((s) => ({ id: s.id, name: s.name }));
    if (seasons.length === 0) return empty;

    const selectedSeasonId = seasonId && seasons.some((s) => s.id === seasonId) ? seasonId : seasons[0].id;

    // Divisions (incl. the null bucket) that have data for the selected season.
    const seasonRows = allRows.filter((r) => r.seasonsId === selectedSeasonId);
    const divisionIds = [...new Set(seasonRows.map((r) => r.divisionId))];
    const realDivisionIds = divisionIds.filter((d): d is number => d != null);
    const divisionRecords = realDivisionIds.length > 0
      ? await db.query.division.findMany({ where: inArray(divisionTable.id, realDivisionIds) })
      : [];
    const divisionNameById = new Map(divisionRecords.map((d) => [d.id, d.name]));
    const divisions: { id: number | null; name: string }[] = divisionIds
      .map((id) => ({ id, name: id == null ? "No division" : divisionNameById.get(id) ?? `Division ${id}` }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Resolve the selected division from the query param.
    let selectedDivisionId: number | null;
    if (divisionParam === NO_DIVISION) selectedDivisionId = null;
    else if (typeof divisionParam === "number" && divisions.some((d) => d.id === divisionParam)) selectedDivisionId = divisionParam;
    else selectedDivisionId = divisions[0]?.id ?? null;

    const divCond = selectedDivisionId == null ? isNull(leagueTable.divisionId) : eq(leagueTable.divisionId, selectedDivisionId);
    const scoped = await db.query.leagueTable.findMany({
      where: and(eq(leagueTable.seasonsId, selectedSeasonId), divCond),
    });

    // League completion flag for the selected (season, division).
    const statusDivCond = selectedDivisionId == null ? isNull(leagueStatus.divisionId) : eq(leagueStatus.divisionId, selectedDivisionId);
    const status = await db.query.leagueStatus.findFirst({
      where: and(eq(leagueStatus.seasonsId, selectedSeasonId), statusDivCond),
    });
    const isComplete = status?.completedAt != null;

    if (scoped.length === 0) {
      return { seasons, selectedSeasonId, divisions, selectedDivisionId, weekNo: null, rows: [], isComplete };
    }

    const weekNo = Math.max(...scoped.map((r) => r.weekNo));
    const latest = scoped.filter((r) => r.weekNo === weekNo).sort((a, b) => a.rank - b.rank);

    const teamIds = [...new Set(latest.map((r) => r.teamId))];
    const teamRecords = await db.query.team.findMany({ where: inArray(teamTable.id, teamIds) });
    const teamNameById = new Map(teamRecords.map((t) => [t.id, t.name]));

    const rows: LeagueRow[] = latest.map((r) => ({
      rank: r.rank,
      previousRank: r.previousRank,
      teamId: r.teamId,
      teamName: teamNameById.get(r.teamId) ?? `Team ${r.teamId}`,
      played: r.played,
      wins: r.wins,
      draws: r.draws,
      losses: r.losses,
      legsFor: r.legsFor,
      legsAgainst: r.legsAgainst,
      points: r.points,
    }));

    return { seasons, selectedSeasonId, divisions, selectedDivisionId, weekNo, rows, isComplete };
  } catch (error) {
    console.error("getLeagueTableData error:", error);
    return empty;
  }
}
