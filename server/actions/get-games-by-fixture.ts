"use server"

import { eq } from "drizzle-orm";
import { db } from ".."



export async function getGamesByFixture(fixtureId: number) {
    try {
        const games = await db.query.games.findMany({
            where: (game) => eq(game.fixtureId, fixtureId),
        });

        const fixture = await db.query.fixtures.findFirst({
            where: (f) => eq(f.id, fixtureId),
        });

        if (!fixture) {
            return { error: "Fixture not found" };
        }

        const players = await db.query.players.findMany(); 

      type GameWithPlayers = typeof games[number] & 
        { players: { id: number; name: string; nickname: string }[] } 
        & {matchDate: string; homeTeam: string; awayTeam: string; isDilfWin: boolean};

      const gamesWithPlayers: GameWithPlayers[] = [];

      for (const game of games) {
        const gamePlayers = await db.query.gamePlayers.findMany({
            where: (gamePlayer) => eq(gamePlayer.gameId, game.id),
        });

        // Add array of player id, name, and nickname to game item
        const playerArray = gamePlayers.map(gp => {
            const player = players.find(p => p.id === gp.playerId);
            return {
              id: player?.id ?? gp.playerId,
              name: player ? player.name : "Unknown",
              nickname: player && player.nickname !== null ? player.nickname : "",
            };
        });

        const date = new Date(fixture.matchDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        gamesWithPlayers.push({
          ...game,
          matchDate: `${day}/${month}/${year}`,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          isDilfWin: (fixture.awayTeam == "DILFS" && game.awayTeamScore > game.homeTeamScore || fixture.homeTeam == "DILFS" && game.homeTeamScore > game.awayTeamScore),
          players: playerArray,
        });
      }

      return { success: gamesWithPlayers };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get games" };
    }
}