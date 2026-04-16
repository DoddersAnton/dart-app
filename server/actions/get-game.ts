"use server"

import { eq } from "drizzle-orm";
import { db } from ".."
import { GameWithPlayers } from "@/types/game-with-players";
import { rounds, team } from "../schema";

export async function getGame(gameId: number) {
  try {
    const game = await db.query.games.findFirst({
      where: (game) => eq(game.id, gameId),
    });

    if (!game) {
      return { error: "No games found for this fixture" };
    }

    const [allPlayers, gamePlayers, gameRounds, fixture] = await Promise.all([
      db.query.players.findMany(),
      db.query.gamePlayers.findMany({ where: (gp) => eq(gp.gameId, game.id) }),
      db.query.rounds.findMany({
        where: eq(rounds.gameId, game.id),
        orderBy: (r, { asc }) => [asc(r.leg), asc(r.roundNumber)],
      }),
      db.query.fixtures.findFirst({ where: (f) => eq(f.id, game.fixtureId) }),
    ]);

    const [homeTeamRecord, awayTeamRecord] = await Promise.all([
      fixture?.homeTeamId
        ? db.query.team.findFirst({ where: (t) => eq(t.id, fixture.homeTeamId!) })
        : Promise.resolve(null),
      fixture?.awayTeamId
        ? db.query.team.findFirst({ where: (t) => eq(t.id, fixture.awayTeamId!) })
        : Promise.resolve(null),
    ]);

    const playerMap = Object.fromEntries(allPlayers.map((p) => [p.id, p]));

    const playerArray = gamePlayers.map((gp) => {
      const player = playerMap[gp.playerId];
      return {
        id: player?.id ?? gp.playerId,
        name: player?.name ?? "Unknown",
        nickname: player?.nickname ?? null,
        imgUrl: player?.imgUrl ?? null,
      };
    });

    const roundArray = gameRounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      leg: r.leg,
      playerId: r.playerId,
      playerName: playerMap[r.playerId]?.name ?? "Unknown",
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      fineAdded: r.fineAdded,
    }));

    const gameWithPlayers: GameWithPlayers = {
      ...game,
      homeTeam: homeTeamRecord?.name ?? fixture?.homeTeam ?? "Home",
      awayTeam: awayTeamRecord?.name ?? fixture?.awayTeam ?? "Away",
      isAppTeamWin: game.isAppTeamWin,
      isAppTeamHome: homeTeamRecord?.isAppTeam === true,
      matchDate: fixture?.matchDate ? fixture.matchDate.toISOString() : null,
      league: fixture?.league ?? null,
      season: fixture?.season ?? null,
      players: playerArray,
      rounds: roundArray,
    };

    return { success: gameWithPlayers };

  } catch (error) {
    console.error(error);
    return { error: "Failed to get game" };
  }
}
