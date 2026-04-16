"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { team } from "../schema";

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

    const [players, homeTeamRecord, awayTeamRecord] = await Promise.all([
      db.query.players.findMany(),
      fixture.homeTeamId ? db.query.team.findFirst({ where: eq(team.id, fixture.homeTeamId) }) : Promise.resolve(null),
      fixture.awayTeamId ? db.query.team.findFirst({ where: eq(team.id, fixture.awayTeamId) }) : Promise.resolve(null),
    ]);

    const homeTeamName = homeTeamRecord?.name ?? fixture.homeTeam;
    const awayTeamName = awayTeamRecord?.name ?? fixture.awayTeam;
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
      players: { id: number; name: string; nickname: string; imgUrl: string | null }[];
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
          imgUrl: player?.imgUrl ?? null,
        };
      });

      const isDilfWin =
        (homeTeamRecord?.isAppTeam === true && game.homeTeamScore > game.awayTeamScore) ||
        (awayTeamRecord?.isAppTeam === true && game.awayTeamScore > game.homeTeamScore);

      return {
        ...game,
        matchDate,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
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
