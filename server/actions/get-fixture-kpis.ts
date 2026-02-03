


import { db } from "..";
import { eq } from "drizzle-orm";
import { FixtureKpiSummary } from "@/types/fixtures-summary";     



export async function getFixtureKpis() {
 try {

      const appTeam  = await db.query.team.findFirst({
              where: (team) => eq(team.isAppTeam, true),
        });

        const homeLocation  = await db.query.locations.findFirst({
              where: (locations) => eq(locations.id, appTeam?.defaultLocationId ?? 0),
        });

        const fixtures = await db.query.fixtures.findMany();
         const games = await db.query.games.findMany();

        const list :FixtureKpiSummary[] = [];

        const season  = await db.query.seasons.findMany();

        for (const s of season) {
            
            const totalSeasonFixtures = fixtures.filter(f => f.seasonsId === s.id);
            const seasonGames = games.filter(g => 
                totalSeasonFixtures.some(f => f.id === g.fixtureId)
            );
            const totalSeasonWins = totalSeasonFixtures.filter(f => f.isAppTeamWin);
            //points are the total games won per match
           
            
            const fixtureKpi: FixtureKpiSummary = {
                season: s.name,
                seasonId: s.id,
                seasonStartDate: s.startDate,
                seasonEndDate: s.endDate,
                totalFixtures: totalSeasonFixtures.length,
                totalFixtureWins: totalSeasonWins.length,
                totalFixtureLosses: totalSeasonFixtures.length - totalSeasonWins.length,
                totalPoints: totalSeasonFixtures
                    .filter(f => f.homeTeamId === appTeam?.id)
                    .reduce((acc, f) => acc + (f.homeTeamScore ?? 0), 0)
                    +
                    totalSeasonFixtures
                    .filter(f => f.awayTeamId === appTeam?.id)
                    .reduce((acc, f) => acc + (f.awayTeamScore ?? 0), 0),
                totalFixturePercentWin: totalSeasonFixtures.length > 0 ? (totalSeasonWins.length / totalSeasonFixtures.length) * 100 : 0,
                totalHomeWins: totalSeasonFixtures.filter(f => f.homeTeamId === appTeam?.id && f.isAppTeamWin && f.matchLocationId === homeLocation?.id).length,
                totalHomeLosses: totalSeasonFixtures.filter(f => f.homeTeamId === appTeam?.id && !f.isAppTeamWin  && f.matchLocationId === homeLocation?.id).length,
                totalAwayWins: totalSeasonFixtures.filter(f => f.awayTeamId === appTeam?.id && f.isAppTeamWin && f.matchLocationId !== homeLocation?.id).length,
                totalAwayLosses: totalSeasonFixtures.filter(f => f.awayTeamId === appTeam?.id && !f.isAppTeamWin  && f.matchLocationId !== homeLocation?.id).length,
                totalGames: seasonGames.length,
                totalGamesWins: seasonGames.filter(g => g.isAppTeamWin).length,
                totalGamesLosses: seasonGames.filter(g => !g.isAppTeamWin).length,
                totalGamesPercentWin: seasonGames.length > 0 ? (seasonGames.filter(g => g.isAppTeamWin).length / seasonGames.length) * 100 : 0,
                totalTeamGameWins: seasonGames.filter(g => g.isAppTeamWin && g.gameType === "Team Game").length,
                totalteamGameLosses: seasonGames.filter(g => !g.isAppTeamWin && g.gameType === "Team Game").length,
                totalDoublesGameWins: seasonGames.filter(g => g.isAppTeamWin && g.gameType === "Doubles").length,
                totalDoublesGameLosses: seasonGames.filter(g => !g.isAppTeamWin && g.gameType === "Doubles").length,
                totalSinglesGameWins: seasonGames.filter(g => g.isAppTeamWin && g.gameType === "Singles").length,
                totalSinglesGameLosses: seasonGames.filter(g => !g.isAppTeamWin && g.gameType === "Singles").length,
            };   list.push(fixtureKpi);
        } 
       

        return { success: list };
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture kpis" };
    }

}