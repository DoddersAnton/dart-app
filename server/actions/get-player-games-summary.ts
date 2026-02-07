"use server";


import { db } from "..";
import { eq } from "drizzle-orm";

export type GamesSummary = {
  season: string;
  totalGames: number;
  totalMatches: number;
  gameTypesSummaries?: GameTypeSummary[];
};

export type GameTypeSummary = {
  gameType: "Singles" | "Doubles" | "Team Game" | "Overall";
  matchesPlayed?: number;
  gamesPlayed?: number;
  playerId?: number;
  playerName?: string;
  nickname?: string | null;
  wins: number;
  loses: number;
  legsFor?: number;
  legsAgainst?: number;
  points?: number;
  variance?: number;
  rankValue?: number;
};

const GAME_TYPES = ["Singles", "Doubles", "Team Game"] as const;
type BaseGameType = (typeof GAME_TYPES)[number];

function createEmptySummary(
  playerId: number,
  playerName: string,
  nickname: string | null,
  gameType: GameTypeSummary["gameType"],
  matchesPlayed = 0,
): GameTypeSummary {
  return {
    gameType,
    playerId,
    playerName,
    nickname,
    matchesPlayed,
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    legsFor: 0,
    legsAgainst: 0,
    points: 0,
    variance: 0,
    rankValue: 0,
  };
}

function recalculateSummaryValues(summary: GameTypeSummary): GameTypeSummary {
  const legsFor = summary.legsFor ?? 0;
  const legsAgainst = summary.legsAgainst ?? 0;

  return {
    ...summary,
    variance: legsFor - legsAgainst,
    points: (summary.wins * 2) + summary.loses,
    rankValue: 0,
  };
}


function assignRankValues(summaries: GameTypeSummary[]): GameTypeSummary[] {
  const ranked = [...summaries];
  const gameTypes: GameTypeSummary["gameType"][] = ["Singles", "Doubles", "Team Game", "Overall"];

  for (const gameType of gameTypes) {
    const group = ranked
      .filter(summary => summary.gameType === gameType)
      .sort((a, b) => {
        const winsLossesVarianceA = a.wins - a.loses;
        const winsLossesVarianceB = b.wins - b.loses;

        if (winsLossesVarianceB !== winsLossesVarianceA) {
          return winsLossesVarianceB - winsLossesVarianceA;
        }

        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        return (b.variance ?? 0) - (a.variance ?? 0);
      });

    let rank = 0;
    let previousKey = "";

    for (let index = 0; index < group.length; index++) {
      const current = group[index];
      const currentKey = `${current.wins - current.loses}|${current.wins}|${current.variance ?? 0}`;

      if (currentKey !== previousKey) {
        rank = index + 1;
        previousKey = currentKey;
      }

      current.rankValue = rank;
    }
  }

  return ranked;
}

export async function getGamesSummaryBySeason() {
  try {
    const players = await db.query.players.findMany();
    const appTeam = await db.query.team.findFirst({
      where: (team) => eq(team.isAppTeam, true),
    });
    const fixtures = await db.query.fixtures.findMany();
    const games = await db.query.games.findMany();
    const gamePlayers = await db.query.gamePlayers.findMany();

    const seasons = [...new Set(fixtures.map(f => f.season))];
    const summaries: GamesSummary[] = [];

    const fixtureById = new Map(fixtures.map(fixture => [fixture.id, fixture]));
    const playersByGameId = new Map<number, typeof gamePlayers>();

    for (const gp of gamePlayers) {
      const entries = playersByGameId.get(gp.gameId) ?? [];
      entries.push(gp);
      playersByGameId.set(gp.gameId, entries);
    }

    for (const season of seasons) {
      const seasonFixtures = fixtures.filter(f => f.season === season);
      const seasonFixtureIds = new Set(seasonFixtures.map(f => f.id));
      const seasonGames = games.filter(g => seasonFixtureIds.has(g.fixtureId));

      const gameTypesSummaries: GameTypeSummary[] = [];

      for (const player of players) {
        const playerSummaries = new Map<GameTypeSummary["gameType"], GameTypeSummary>([
          ["Singles", createEmptySummary(player.id, player.name, player.nickname ?? null, "Singles")],
          ["Doubles", createEmptySummary(player.id, player.name, player.nickname ?? null, "Doubles")],
          ["Team Game", createEmptySummary(player.id, player.name, player.nickname ?? null, "Team Game")],
          ["Overall", createEmptySummary(player.id, player.name, player.nickname ?? null, "Overall")],
        ]);

        const uniqueMatchesPlayed = new Set<number>();

        for (const game of seasonGames) {
          const gameType = game.gameType as BaseGameType;
          if (!GAME_TYPES.includes(gameType)) continue;

          const gamePlayersForGame = playersByGameId.get(game.id) ?? [];
          const hasPlayerInGame = gamePlayersForGame.some(pg => pg.playerId === player.id);
          if (!hasPlayerInGame) continue;

          uniqueMatchesPlayed.add(game.fixtureId);

          const fixture = fixtureById.get(game.fixtureId);
          const appTeamIsHome = fixture?.homeTeamId === appTeam?.id;
          const appTeamIsAway = fixture?.awayTeamId === appTeam?.id;

          const appTeamLegs = appTeamIsHome
            ? game.homeTeamScore
            : appTeamIsAway
              ? game.awayTeamScore
              : 0;
          const opponentLegs = appTeamIsHome
            ? game.awayTeamScore
            : appTeamIsAway
              ? game.homeTeamScore
              : 0;

          const typeSummary = playerSummaries.get(gameType);
          const overallSummary = playerSummaries.get("Overall");
          if (!typeSummary || !overallSummary) continue;

          const didWin = game.isAppTeamWin;

          typeSummary.gamesPlayed = (typeSummary.gamesPlayed ?? 0) + 1;
          typeSummary.wins += didWin ? 1 : 0;
          typeSummary.loses += didWin ? 0 : 1;
          typeSummary.legsFor = (typeSummary.legsFor ?? 0) + appTeamLegs;
          typeSummary.legsAgainst = (typeSummary.legsAgainst ?? 0) + opponentLegs;

          overallSummary.gamesPlayed = (overallSummary.gamesPlayed ?? 0) + 1;
          overallSummary.wins += didWin ? 1 : 0;
          overallSummary.loses += didWin ? 0 : 1;
          overallSummary.legsFor = (overallSummary.legsFor ?? 0) + appTeamLegs;
          overallSummary.legsAgainst = (overallSummary.legsAgainst ?? 0) + opponentLegs;
        }

        for (const [key, summary] of playerSummaries) {
          summary.matchesPlayed = uniqueMatchesPlayed.size;
          playerSummaries.set(key, recalculateSummaryValues(summary));
        }

        gameTypesSummaries.push(
          playerSummaries.get("Singles")!,
          playerSummaries.get("Doubles")!,
          playerSummaries.get("Team Game")!,
          playerSummaries.get("Overall")!,
        );
      }

      const rankedGameTypesSummaries = assignRankValues(gameTypesSummaries);

      summaries.push({
        season,
        totalGames: seasonGames.length,
        totalMatches: seasonFixtures.length,
        gameTypesSummaries: rankedGameTypesSummaries,
      });
    }

    return { success: summaries };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get games summary" };
  }
}
