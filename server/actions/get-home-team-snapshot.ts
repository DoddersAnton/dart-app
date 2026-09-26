"use server";

import { and, asc, desc, eq, gte, inArray, or } from "drizzle-orm";
import { db } from "..";
import { fixtures as fixturesTable, leagueTable, seasons as seasonsTable, team as teamTable } from "../schema";
import { getLeagueTableData } from "./get-league-table";
import { NO_DIVISION, type LeagueRow } from "@/lib/league-table";

export type UpcomingFixture = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  isHome: boolean;
  matchDate: string; // ISO string
  matchLocation: string;
  league: string;
};

export type HomeLeagueSnapshot = {
  seasonName: string;
  divisionName: string | null;
  weekNo: number | null;
  isComplete: boolean;
  rows: LeagueRow[];
  activeTeamId: number;
};

export type HomeTeamSnapshot = {
  upcomingFixtures: UpcomingFixture[];
  league: HomeLeagueSnapshot | null;
};

// Statuses that mean a fixture is over and shouldn't appear in "upcoming".
const FINISHED_STATUSES = ["completed", "cancelled"];

export async function getHomeTeamSnapshot(activeTeamId?: number | null): Promise<HomeTeamSnapshot> {
  const empty: HomeTeamSnapshot = { upcomingFixtures: [], league: null };
  if (!activeTeamId) return empty;

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Upcoming fixtures involving the active team (not finished, today or later).
    const rawFixtures = await db.query.fixtures.findMany({
      where: and(
        or(eq(fixturesTable.homeTeamId, activeTeamId), eq(fixturesTable.awayTeamId, activeTeamId)),
        gte(fixturesTable.matchDate, startOfToday),
      ),
      orderBy: [asc(fixturesTable.matchDate)],
      limit: 12,
    });

    const openFixtures = rawFixtures
      .filter((f) => !FINISHED_STATUSES.includes((f.matchStatus ?? "").toLowerCase()))
      .slice(0, 5);

    const teamIds = [
      ...new Set(
        openFixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]).filter((id): id is number => id != null),
      ),
    ];
    const teamRecords = teamIds.length
      ? await db.query.team.findMany({ where: inArray(teamTable.id, teamIds) })
      : [];
    const teamNameById = new Map(teamRecords.map((t) => [t.id, t.name]));

    const upcomingFixtures: UpcomingFixture[] = openFixtures.map((f) => ({
      id: f.id,
      homeTeam: (f.homeTeamId ? teamNameById.get(f.homeTeamId) : null) ?? f.homeTeam,
      awayTeam: (f.awayTeamId ? teamNameById.get(f.awayTeamId) : null) ?? f.awayTeam,
      isHome: f.homeTeamId === activeTeamId,
      matchDate: (f.matchDate instanceof Date ? f.matchDate : new Date(f.matchDate)).toISOString(),
      matchLocation: f.matchLocation,
      league: f.league,
    }));

    // League snapshot for the active team's most recent season/division with data.
    const league = await getActiveTeamLeagueSnapshot(activeTeamId);

    return { upcomingFixtures, league };
  } catch (error) {
    console.error("getHomeTeamSnapshot error:", error);
    return empty;
  }
}

async function getActiveTeamLeagueSnapshot(activeTeamId: number): Promise<HomeLeagueSnapshot | null> {
  // Every league-table row the active team appears in, newest season first.
  const teamRows = await db
    .select({
      seasonsId: leagueTable.seasonsId,
      divisionId: leagueTable.divisionId,
      weekNo: leagueTable.weekNo,
    })
    .from(leagueTable)
    .innerJoin(seasonsTable, eq(leagueTable.seasonsId, seasonsTable.id))
    .where(eq(leagueTable.teamId, activeTeamId))
    .orderBy(desc(seasonsTable.startDate), desc(leagueTable.weekNo));

  if (teamRows.length === 0) return null;

  const { seasonsId, divisionId } = teamRows[0];
  const divisionParam = divisionId == null ? NO_DIVISION : divisionId;

  const data = await getLeagueTableData(seasonsId, divisionParam);
  if (data.rows.length === 0) return null;

  const seasonName = data.seasons.find((s) => s.id === data.selectedSeasonId)?.name ?? "Current season";
  const divisionName = data.divisions.find((d) => d.id === data.selectedDivisionId)?.name ?? null;

  return {
    seasonName,
    divisionName: divisionName === "No division" ? null : divisionName,
    weekNo: data.weekNo,
    isComplete: data.isComplete,
    rows: data.rows,
    activeTeamId,
  };
}
