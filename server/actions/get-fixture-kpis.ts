


import { db } from "..";
import { eq } from "drizzle-orm";
import { FixtureKpiSummary } from "@/types/fixtures-summary";     



export async function getFixtureKpis(activeTeamId?: number | null) {
 try {

      // Use activeTeamId when provided; fall back to deprecated isAppTeam flag
      const appTeam = activeTeamId
        ? await db.query.team.findFirst({ where: (team) => eq(team.id, activeTeamId) })
        : await db.query.team.findFirst({ where: (team) => eq(team.isAppTeam, true) });

        const homeLocation  = await db.query.locations.findFirst({
              where: (locations) => eq(locations.id, appTeam?.defaultLocationId ?? 0),
        });

        const allFixtures = await db.query.fixtures.findMany();
        const games = await db.query.games.findMany();
        const fixtureById = new Map(allFixtures.map(f => [f.id, f]));

        // When activeTeamId is known, filter to that team's fixtures and compute dynamically
        const fixtures = appTeam
          ? allFixtures.filter(f => f.homeTeamId === appTeam.id || f.awayTeamId === appTeam.id)
          : allFixtures;

        const fixtureWon = (f: typeof allFixtures[0]) => {
          if (!appTeam) return false;
          return f.homeTeamId === appTeam.id
            ? f.homeTeamScore > f.awayTeamScore
            : f.awayTeamScore > f.homeTeamScore;
        };
        const gameWon = (g: typeof games[0]) => {
          const fix = fixtureById.get(g.fixtureId);
          if (!appTeam || !fix) return g.isAppTeamWin;
          return fix.homeTeamId === appTeam.id
            ? g.homeTeamScore > g.awayTeamScore
            : g.awayTeamScore > g.homeTeamScore;
        };

        const list :FixtureKpiSummary[] = [];

        const season  = await db.query.seasons.findMany();

        for (const s of season) {

            const totalSeasonFixtures = fixtures.filter(f => f.seasonsId === s.id);
            const seasonGames = games.filter(g =>
                totalSeasonFixtures.some(f => f.id === g.fixtureId)
            );
            const totalSeasonWins = totalSeasonFixtures.filter(fixtureWon);

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
                totalHomeWins: totalSeasonFixtures.filter(f => f.homeTeamId === appTeam?.id && fixtureWon(f) && f.matchLocationId === homeLocation?.id).length,
                totalHomeLosses: totalSeasonFixtures.filter(f => f.homeTeamId === appTeam?.id && !fixtureWon(f) && f.matchLocationId === homeLocation?.id).length,
                totalAwayWins: totalSeasonFixtures.filter(f => f.awayTeamId === appTeam?.id && fixtureWon(f) && f.matchLocationId !== homeLocation?.id).length,
                totalAwayLosses: totalSeasonFixtures.filter(f => f.awayTeamId === appTeam?.id && !fixtureWon(f) && f.matchLocationId !== homeLocation?.id).length,
                totalGames: seasonGames.length,
                totalGamesWins: seasonGames.filter(gameWon).length,
                totalGamesLosses: seasonGames.filter(g => !gameWon(g)).length,
                totalGamesPercentWin: seasonGames.length > 0 ? (seasonGames.filter(gameWon).length / seasonGames.length) * 100 : 0,
                totalTeamGameWins: seasonGames.filter(g => gameWon(g) && g.gameType === "Team Game").length,
                totalteamGameLosses: seasonGames.filter(g => !gameWon(g) && g.gameType === "Team Game").length,
                totalDoublesGameWins: seasonGames.filter(g => gameWon(g) && g.gameType === "Doubles").length,
                totalDoublesGameLosses: seasonGames.filter(g => !gameWon(g) && g.gameType === "Doubles").length,
                totalSinglesGameWins: seasonGames.filter(g => gameWon(g) && g.gameType === "Singles").length,
                totalSinglesGameLosses: seasonGames.filter(g => !gameWon(g) && g.gameType === "Singles").length,
            };   list.push(fixtureKpi);
        } 
       

        return { success: list };
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture kpis" };
    }

}