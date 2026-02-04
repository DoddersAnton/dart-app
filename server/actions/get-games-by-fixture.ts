"use server";

import { eq } from "drizzle-orm";
import { db } from "..";

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
    const gameIds = games.map((game) => game.id);
    const gamePlayers = await db.query.gamePlayers.findMany({
      where: (gamePlayer, { inArray }) => inArray(gamePlayer.gameId, gameIds),
    });

    const playersById = new Map(players.map((player) => [player.id, player]));
    const gamePlayersByGameId = new Map<number, typeof gamePlayers>();

    for (const gamePlayer of gamePlayers) {
      const bucket = gamePlayersByGameId.get(gamePlayer.gameId);
      if (bucket) {
        bucket.push(gamePlayer);
      } else {
        gamePlayersByGameId.set(gamePlayer.gameId, [gamePlayer]);
      }
    }

    type GameWithPlayers = typeof games[number] & {
      players: { id: number; name: string; nickname: string }[];
      matchDate: string;
      homeTeam: string;
      awayTeam: string;
      isDilfWin: boolean;
    };

    const date = new Date(fixture.matchDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const matchDate = `${day}/${month}/${year}`;

    const gamesWithPlayers: GameWithPlayers[] = games.map((game) => {
      const gamePlayerRows = gamePlayersByGameId.get(game.id) ?? [];
      const playerArray = gamePlayerRows.map((gp) => {
        const player = playersById.get(gp.playerId);
        return {
          id: player?.id ?? gp.playerId,
          name: player ? player.name : "Unknown",
          nickname: player?.nickname ?? "",
        };
      });

      const isDilfWin =
        (fixture.awayTeam === "DILFS" &&
          game.awayTeamScore > game.homeTeamScore) ||
        (fixture.homeTeam === "DILFS" &&
          game.homeTeamScore > game.awayTeamScore);

      return {
        ...game,
        matchDate,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        isDilfWin,
        players: playerArray,
      };
    });

    return { success: gamesWithPlayers };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get games" };
  }
}
