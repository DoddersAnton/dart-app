
export type GameWithPlayers = {
    id: number;
    homeTeamScore: number;
    awayTeamScore: number;
    fixtureId: number;
    gameType: string;
    players: Array<{
        id: number;
        name: string;
        nickname: string | null;
    }>;
};