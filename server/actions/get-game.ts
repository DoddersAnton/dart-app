"use server"

import { eq } from "drizzle-orm";
import { db } from ".."
import { GameWithPlayers, GamePlayerEntry } from "@/types/game-with-players";
import { rounds } from "../schema";

export async function getGame(gameId: number, activeTeamId?: number | null) {
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

    const toEntry = (playerId: number): GamePlayerEntry => {
      const player = playerMap[playerId];
      return {
        id: player?.id ?? playerId,
        name: player?.name ?? "Unknown",
        nickname: player?.nickname ?? null,
        imgUrl: player?.imgUrl ?? null,
      };
    };

    // Split the roster into home / away. `side` is the denormalised source of truth;
    // fall back to teamId vs the fixture's team ids for any rows not yet stamped.
    const homePlayers: GamePlayerEntry[] = [];
    const awayPlayers: GamePlayerEntry[] = [];
    const allEntries: GamePlayerEntry[] = [];
    for (const gp of gamePlayers) {
      const entry = toEntry(gp.playerId);
      allEntries.push(entry);
      const side =
        gp.side === "home" || gp.side === "away"
          ? gp.side
          : gp.teamId && fixture?.homeTeamId === gp.teamId
          ? "home"
          : gp.teamId && fixture?.awayTeamId === gp.teamId
          ? "away"
          : null;
      if (side === "home") homePlayers.push(entry);
      else if (side === "away") awayPlayers.push(entry);
    }

    const nameOf = (id: number | null) =>
      id != null ? playerMap[id]?.name ?? "Unknown" : null;

    const roundArray = gameRounds.map((r) => ({
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
    }));

    const mySide: "home" | "away" | null =
      activeTeamId && fixture?.homeTeamId === activeTeamId
        ? "home"
        : activeTeamId && fixture?.awayTeamId === activeTeamId
        ? "away"
        : null;

    const gameWithPlayers: GameWithPlayers = {
      ...game,
      homeTeam: homeTeamRecord?.name ?? fixture?.homeTeam ?? "Home",
      awayTeam: awayTeamRecord?.name ?? fixture?.awayTeam ?? "Away",
      isAppTeamWin: game.isAppTeamWin,
      mySide,
      homeTeamId: fixture?.homeTeamId ?? null,
      awayTeamId: fixture?.awayTeamId ?? null,
      homeTeamFinesEnabled: homeTeamRecord?.finesEnabled ?? false,
      awayTeamFinesEnabled: awayTeamRecord?.finesEnabled ?? false,
      matchDate: fixture?.matchDate ? fixture.matchDate.toISOString() : null,
      league: fixture?.league ?? null,
      season: fixture?.season ?? null,
      players: allEntries,
      homePlayers,
      awayPlayers,
      rounds: roundArray,
    };

    return { success: gameWithPlayers };

  } catch (error) {
    console.error(error);
    return { error: "Failed to get game" };
  }
}
