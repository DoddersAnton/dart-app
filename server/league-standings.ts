import { and, eq, isNull } from "drizzle-orm";
import { db } from ".";
import { leagueStatus, leagueTable } from "./schema";

// A single team's record going into a week's standings snapshot.
export type TeamStanding = {
  teamId: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  legsFor: number;
  legsAgainst: number;
};

/**
 * Rank the given team standings (points = legs won), resolve each team's previous
 * rank from its most recent earlier submitted week, and (idempotently) write the
 * snapshot rows for this (season, division, week).
 */
export async function writeWeekStandings(
  seasonId: number,
  divisionId: number | null,
  weekNo: number,
  teams: TeamStanding[],
): Promise<void> {
  const divCond = divisionId == null ? isNull(leagueTable.divisionId) : eq(leagueTable.divisionId, divisionId);

  const statusDivCond = divisionId == null ? isNull(leagueStatus.divisionId) : eq(leagueStatus.divisionId, divisionId);
  const status = await db.query.leagueStatus.findFirst({
    where: and(eq(leagueStatus.seasonsId, seasonId), statusDivCond),
  });
  if (status?.completedAt) {
    throw new Error("League is marked complete — standings are locked.");
  }

  

  const standings = teams.map((t) => ({ ...t, points: t.legsFor }));
  standings.sort((x, y) =>
    y.points - x.points ||
    (y.legsFor - y.legsAgainst) - (x.legsFor - x.legsAgainst) ||
    y.wins - x.wins ||
    x.teamId - y.teamId,
  );

  // Previous rank = each team's rank in its most recent earlier submitted week.
  const priorSnapshots = await db.query.leagueTable.findMany({
    where: and(eq(leagueTable.seasonsId, seasonId), divCond),
  });
  const previousRankByTeam = new Map<number, { week: number; rank: number }>();
  for (const row of priorSnapshots) {
    if (row.weekNo >= weekNo) continue;
    const cur = previousRankByTeam.get(row.teamId);
    if (!cur || row.weekNo > cur.week) previousRankByTeam.set(row.teamId, { week: row.weekNo, rank: row.rank });
  }

  // Re-submitting a week is idempotent: clear then rewrite this week's rows.
  await db.delete(leagueTable).where(
    and(eq(leagueTable.seasonsId, seasonId), divCond, eq(leagueTable.weekNo, weekNo)),
  );

  const now = new Date();
  await db.insert(leagueTable).values(
    standings.map((s, idx) => ({
      seasonsId: seasonId,
      divisionId: divisionId ?? undefined,
      weekNo,
      teamId: s.teamId,
      played: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      legsFor: s.legsFor,
      legsAgainst: s.legsAgainst,
      points: s.points,
      rank: idx + 1,
      previousRank: previousRankByTeam.get(s.teamId)?.rank ?? null,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
