

export type FixtureListSummary = {
    id: number;
    season: string;
    seasonsId: number | null;
    matchDate: string;
    matchLocation: string;
    matchLocationId: number | null,
    homeTeam: string;
    homeTeamId: number | null;
    awayTeam: string;
    awayTeamId: number | null;
    isAppTeamWin: boolean | null;
    homeTeamScore: number;
    awayTeamScore: number;
    matchStatus: string;
    league: string;
    createdAt: string;
    updatedAt: string;


}

export type FixtureKpiSummary = {
    season: string;
    totalFixtures: number;
    totalFixtureWins: number;
    totalFixturePercentWin: number;
    totalFixtureLosses: number;
    totalHomeWins: number;
    totalHomeLosses: number;
    totalAwayWins: number;
    totalAwayLosses: number;
    totalGames: number;
    totalGamesWins: number;
    totalGamesLosses: number;
    totalGamesPercentWin: number;
    totalTeamGameWins: number;
    totalteamGameLosses: number;
    totalDoublesGameWins: number;
    totalDoublesGameLosses: number;
    totalSinglesGameWins: number;
    totalSinglesGameLosses: number;
}

