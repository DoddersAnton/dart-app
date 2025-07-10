"use server"

import { eq } from "drizzle-orm";
import { db } from ".."



export async function getGame(gameId: number) {
    try {
        const game = await db.query.games.findFirst({
            where: (game) => eq(game.id, gameId),
        });

        if (!game) {
            return { error: "No games found for this fixture" };
        }

        const players = await db.query.players.findMany(); 

      type GameWithPlayers = typeof game & { players: { id: number; name: string; nickname: string }[] };

      const gamesWithPlayers: GameWithPlayers[] = [];

      
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
      

      return { success: gamesWithPlayers };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get game" };
    }
}