"use server";

import { and, asc, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";
import { db } from "..";
import {
  division as divisionTable,
  fixtures as fixturesTable,
  leagueStatus,
  leagueTable,
  seasons as seasonsTable,
  team as teamTable,
} from "../schema";
import { type LeagueRow } from "@/lib/league-table";

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
const FINISHED_STATUSES = ["completed", "cancelled", "in progress"];

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
  const latestTeamRow = await db
    .select({
      seasonsId: leagueTable.seasonsId,
      divisionId: leagueTable.divisionId,
      weekNo: leagueTable.weekNo,
    })
    .from(leagueTable)
    .innerJoin(seasonsTable, eq(leagueTable.seasonsId, seasonsTable.id))
    .where(eq(leagueTable.teamId, activeTeamId))
    .orderBy(desc(seasonsTable.startDate), desc(leagueTable.weekNo))
    .limit(1);

  const latestSnapshot = latestTeamRow[0];
  if (!latestSnapshot) return null;

  const { seasonsId, divisionId, weekNo } = latestSnapshot;
  const divisionCondition = divisionId == null ? isNull(leagueTable.divisionId) : eq(leagueTable.divisionId, divisionId);
  const statusDivisionCondition = divisionId == null ? isNull(leagueStatus.divisionId) : eq(leagueStatus.divisionId, divisionId);

  const [seasonRecord, divisionRecord, status, latestRows] = await Promise.all([
    db.query.seasons.findFirst({
      where: eq(seasonsTable.id, seasonsId),
    }),
    divisionId == null
      ? Promise.resolve(null)
      : db.query.division.findFirst({
          where: eq(divisionTable.id, divisionId),
        }),
    db.query.leagueStatus.findFirst({
      where: and(eq(leagueStatus.seasonsId, seasonsId), statusDivisionCondition),
    }),
    db.query.leagueTable.findMany({
      where: and(eq(leagueTable.seasonsId, seasonsId), divisionCondition, eq(leagueTable.weekNo, weekNo)),
      orderBy: [asc(leagueTable.rank)],
    }),
  ]);

  if (latestRows.length === 0) return null;

  const teamIds = [...new Set(latestRows.map((row) => row.teamId))];
  const teamRecords = teamIds.length
    ? await db.query.team.findMany({ where: inArray(teamTable.id, teamIds) })
    : [];
  const teamNameById = new Map(teamRecords.map((team) => [team.id, team.name]));

  const rows: LeagueRow[] = latestRows.map((row) => ({
    rank: row.rank,
    previousRank: row.previousRank,
    teamId: row.teamId,
    teamName: teamNameById.get(row.teamId) ?? `Team ${row.teamId}`,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    legsFor: row.legsFor,
    legsAgainst: row.legsAgainst,
    points: row.points,
  }));

  const seasonName = seasonRecord?.name ?? "Current season";
  const divisionName = divisionRecord?.name ?? null;

  return {
    seasonName,
    divisionName: divisionName === "No division" ? null : divisionName,
    weekNo,
    isComplete: status?.completedAt != null,
    rows,
    activeTeamId,
  };
}
