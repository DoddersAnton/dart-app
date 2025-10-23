"use server";


import { db } from "..";
import { console } from "inspector";

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
  rankValue?: number;
};


export async function getGamesSummaryBySeason() {
  try {
    const players = await db.query.players.findMany();
    const fixtures = await db.query.fixtures.findMany();
    const games = await db.query.games.findMany();
    const gamePlayers = await db.query.gamePlayers.findMany();

    const seasons = [...new Set(fixtures.map(f => f.season))];
    const summaries: GamesSummary[] = [];

    for (const season of seasons) {
      const seasonFixtures = fixtures.filter(f => f.season === season);
      const seasonFixtureIds = seasonFixtures.map(f => f.id);

      const seasonGames = games.filter(g => seasonFixtureIds.includes(g.fixtureId));
      const seasonGameIds = seasonGames.map(g => g.id);

      const seasonPlayerGames = gamePlayers.filter(pg => seasonGameIds.includes(pg.gameId));

      const gameTypesSummaries: GameTypeSummary[] = [];

      for (const player of players) {
        const playerGames = seasonPlayerGames.filter(pg => pg.playerId === player.id);
        const uniqueMatchesPlayed = new Set(
          playerGames
            .map(pg => seasonGames.find(g => g.id === pg.gameId)?.fixtureId)
            .filter(id => id !== undefined)
        ).size;

        const playerGameDetails = playerGames.map(pg => {
          const game = seasonGames.find(g => g.id === pg.gameId);
          const fixture = fixtures.find(f => f.id === game?.fixtureId);

          const isDilfsHome = fixture?.homeTeam === "DILFS";
          const isDilfsAway = fixture?.awayTeam === "DILFS";

          const isDilfsWin =
            (isDilfsHome && (game?.homeTeamScore ?? 0) > (game?.awayTeamScore ?? 0)) ||
            (isDilfsAway && (game?.awayTeamScore ?? 0) > (game?.homeTeamScore ?? 0));

          const isDilfsLoss =
            (isDilfsHome && (game?.homeTeamScore ?? 0) < (game?.awayTeamScore ?? 0)) ||
            (isDilfsAway && (game?.awayTeamScore ?? 0) < (game?.homeTeamScore ?? 0));

          return {
            gameType: game?.gameType as "Singles" | "Doubles" | "Team Game",
            isDilfsWin,
            isDilfsLoss,
          };
        });

        const buildSummary = (type: "Singles" | "Doubles" | "Team Game") => {
          const wins = playerGameDetails.filter(g => g.gameType === type && g.isDilfsWin).length;
          const loses = playerGameDetails.filter(g => g.gameType === type && g.isDilfsLoss).length;
          return {
            gameType: type,
            playerId: player.id,
            playerName: player.name,
            nickname: player.nickname ?? null,
            matchesPlayed: uniqueMatchesPlayed,
            gamesPlayed: playerGameDetails.filter(g => g.gameType === type).length,
            wins,
            loses,
            rankValue: wins - loses,
          } as GameTypeSummary;
        };

        const singles = buildSummary("Singles");
        const doubles = buildSummary("Doubles");
        const team = buildSummary("Team Game");

        const overall: GameTypeSummary = {
          gameType: "Overall",
          playerId: player.id,
          playerName: player.name,
          nickname: player.nickname ?? null,
          matchesPlayed: uniqueMatchesPlayed,
          gamesPlayed: playerGameDetails.length,
          wins: singles.wins + doubles.wins + team.wins,
          loses: singles.loses + doubles.loses + team.loses,
          rankValue: (singles.wins + doubles.wins + team.wins) - (singles.loses + doubles.loses + team.loses),
        };

        gameTypesSummaries.push(singles, doubles, team, overall);
      }

      summaries.push({
        season,
        totalGames: seasonGames.length,
        totalMatches: seasonFixtures.length,
        gameTypesSummaries,
      });
    }

    return { success: summaries };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get games summary" };
  }
}
