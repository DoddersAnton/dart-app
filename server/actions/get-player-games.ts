"use server"

import { eq } from "drizzle-orm";
import { db } from ".."




export type PlayerGameDetails = {
    playerId: number;                   //player details
    playerName: string;
    nickname: string | null;
    fixtureId: number | null;
    season: string;       //fixture details   
    matchDate: string | null;
    homeTeam: string | null;
    awayTeam: string | null;
    homeTeamScore: number | null;
    awayTeamScore: number | null;
    games: {
        gameId: number;
        gameType: string | null;
        gameHomeTeamScore: number | null;
        gameAwayTeamScore: number | null;
        isDilfsWin: boolean;
    }[] | [];
};


export async function getGamesByPlayer(playerId: number) {
    try {

        const player = await db.query.players.findFirst({
            where: (player) => eq(player.id, playerId),
        });

        if (!player) {
            return { error: "Player not found" };
        }

        const playerGames = await db.query.gamePlayers.findMany({
            where: (gamePlayer) => eq(gamePlayer.playerId, playerId),
        });

        const fixtures = await db.query.fixtures.findMany();
        const games = await db.query.games.findMany(); 
        
    // Map playerGames to PlayerGameDetails type
    const gamesWithPlayers: PlayerGameDetails[] = playerGames.map((gamePlayer) => {
        const game = games.find(g => g.id === gamePlayer.gameId);
        const fixture = fixtures.find(f => f.id === game?.fixtureId);

        return {
            playerId: player.id,
            playerName: player.name,
            nickname: player.nickname ?? null,
            fixtureId: fixture?.id ?? null,
            season: fixture?.season ?? "Unknown",
            matchDate: fixture?.matchDate ? fixture.matchDate.toISOString() : null,
            homeTeam: fixture?.homeTeam ?? null,
            awayTeam: fixture?.awayTeam ?? null,
            homeTeamScore: fixture?.homeTeamScore ?? null,
            awayTeamScore: fixture?.awayTeamScore ?? null,
            isDilfsWin: (fixture?.awayTeam == "DILFS" && (game?.awayTeamScore ?? 0) > (game?.homeTeamScore ?? 0) || fixture?.homeTeam == "DILFS" && (game?.homeTeamScore ?? 0) > (game?.awayTeamScore ?? 0)),
            games: [{
                gameId: game?.id ?? 0,
                gameType: game?.gameType ?? null,
                gameHomeTeamScore: game?.homeTeamScore ?? null,
                gameAwayTeamScore: game?.awayTeamScore ?? null,
                isDilfsWin: (
                    (fixtures.find(f => f.id === game?.fixtureId)?.homeTeam === "DILFS" &&
                        (game?.homeTeamScore ?? 0) > (game?.awayTeamScore ?? 0)) ||
                    (fixtures.find(f => f.id === game?.fixtureId)?.awayTeam === "DILFS" &&
                        (game?.awayTeamScore ?? 0) > (game?.homeTeamScore ?? 0))
                )
            }]
        };
    });
    return { success: gamesWithPlayers };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get games" };
    }
}