"use server"

import { eq } from "drizzle-orm";
import { db } from ".."



export async function getGamesByFixture(fixtureId: number) {
    try {
        const games = await db.query.games.findMany({
            where: (game) => eq(game.fixtureId, fixtureId),
        });

        const players = await db.query.players.findMany(); 

      type GameWithPlayers = typeof games[number] & { players: { id: number; name: string; nickname: string }[] };

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

        gamesWithPlayers.push({
          ...game,
          players: playerArray,
        });
      }

      return { success: gamesWithPlayers };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get games" };
    }
}