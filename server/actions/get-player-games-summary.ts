"use server";


import { db } from "..";
import { console } from "inspector";

export type GamesSummary = {
  playerId?: number;
  playerName?: string;
  nickname?: string | null;
  season: string; //summary of games in this fixture
  totalGames: number;
  totalMatches: number;
  matchesPlayed?: number;   
  gamesPlayed?: number;
  wins: number;
  loses: number;
  singlesWins: number;
  singlesLoses: number;
  doublesWins: number;
  doublesLoses: number;
  teamWins: number;
  teamLoses: number;
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

      for (const player of players) {
        const playerGames = seasonPlayerGames.filter(pg => pg.playerId === player.id);
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
            gameType: game?.gameType,
            fixtureId: fixture?.id,
            isDilfsWin,
            isDilfsLoss,
          };
        });

        // Get unique fixture appearances (how many matches the player played in)
        const uniqueFixturesPlayed = new Set(playerGameDetails.map(g => g.fixtureId)).size;

        // Totals
        const singlesWins = playerGameDetails.filter(g => g.gameType === "Singles" && g.isDilfsWin).length;
        const singlesLoses = playerGameDetails.filter(g => g.gameType === "Singles" && g.isDilfsLoss).length;
        const doublesWins = playerGameDetails.filter(g => g.gameType === "Doubles" && g.isDilfsWin).length;
        const doublesLoses = playerGameDetails.filter(g => g.gameType === "Doubles" && g.isDilfsLoss).length;
        const teamWins = playerGameDetails.filter(g => g.gameType === "Team Game" && g.isDilfsWin).length;
        const teamLoses = playerGameDetails.filter(g => g.gameType === "Team Game" && g.isDilfsLoss).length;

        const wins = singlesWins + doublesWins + teamWins;
        const loses = singlesLoses + doublesLoses + teamLoses;
        const rankValue = wins - loses;

        summaries.push({
          playerId: player.id,
          playerName: player.name,
          nickname: player.nickname ?? null,
          season,
          totalGames: seasonGames.length,
          totalMatches: seasonFixtures.length,
          matchesPlayed: uniqueFixturesPlayed,
          gamesPlayed: playerGameDetails.length,
          wins,
          loses,
          singlesWins,
          singlesLoses,
          doublesWins,
          doublesLoses,
          teamWins,
          teamLoses,
          rankValue,
        });
      }
    }

    // Optional: sort each group by season and assign ranks per category (if needed)

    return { success: summaries };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get games summary" };
  }
}