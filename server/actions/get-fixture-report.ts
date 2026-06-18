"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "..";
import { rounds } from "../schema";
import { GameRound } from "@/types/game-with-players";

export type FixtureReportGame = {
  id: number;
  gameType: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  rounds: GameRound[];
};

export async function getFixtureReport(fixtureId: number) {
  try {
    const fixture = await db.query.fixtures.findFirst({ where: (f) => eq(f.id, fixtureId) });
    if (!fixture) return { error: "Fixture not found" };

    const games = await db.query.games.findMany({ where: (g) => eq(g.fixtureId, fixtureId) });
    if (games.length === 0) return { success: [] as FixtureReportGame[] };

    const gameIds = games.map((g) => g.id);

    const [allPlayers, allRounds, homeTeamRecord, awayTeamRecord] = await Promise.all([
      db.query.players.findMany(),
      db.query.rounds.findMany({
        where: inArray(rounds.gameId, gameIds),
        orderBy: (r, { asc }) => [asc(r.gameId), asc(r.leg), asc(r.roundNumber)],
      }),
      fixture.homeTeamId
        ? db.query.team.findFirst({ where: (t) => eq(t.id, fixture.homeTeamId!) })
        : Promise.resolve(null),
      fixture.awayTeamId
        ? db.query.team.findFirst({ where: (t) => eq(t.id, fixture.awayTeamId!) })
        : Promise.resolve(null),
    ]);

    const playerMap = Object.fromEntries(allPlayers.map((p) => [p.id, p]));
    const nameOf = (id: number | null) => (id != null ? playerMap[id]?.name ?? "Unknown" : null);

    const homeTeam = homeTeamRecord?.name ?? fixture.homeTeam ?? "Home";
    const awayTeam = awayTeamRecord?.name ?? fixture.awayTeam ?? "Away";

    const report: FixtureReportGame[] = games.map((game) => ({
      id: game.id,
      gameType: game.gameType,
      homeTeam,
      awayTeam,
      homeTeamScore: game.homeTeamScore,
      awayTeamScore: game.awayTeamScore,
      rounds: allRounds
        .filter((r) => r.gameId === game.id)
        .map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          leg: r.leg,
          playerId: r.playerId,
          playerName: r.playerId != null ? playerMap[r.playerId]?.name ?? "Unknown" : null,
          homePlayerId: r.homePlayerId,
          awayPlayerId: r.awayPlayerId,
          homePlayerName: nameOf(r.homePlayerId),
          awayPlayerName: nameOf(r.awayPlayerId),
          homeScore: r.homeScore,
          awayScore: r.awayScore,
          dartsUsed: r.dartsUsed,
          homeDartsUsed: r.homeDartsUsed,
          awayDartsUsed: r.awayDartsUsed,
          fineAdded: r.fineAdded,
        })),
    }));

    return { success: report };
  } catch (error) {
    console.error("getFixtureReport error:", error);
    return { error: "Failed to build fixture report" };
  }
}
