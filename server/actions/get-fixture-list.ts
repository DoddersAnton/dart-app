"use server";

import { db } from "..";
import { FixtureListSummary } from "@/types/fixtures-summary";


  const formatDate = (d?: Date | string | null) => {
            if (!d) return "";
            const date = typeof d === "string" ? new Date(d) : d;
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

export async function getFixtureList(activeTeamId?: number | null) {
 try {
        const [fixtures, games, teams] = await Promise.all([
          db.query.fixtures.findMany(),
          db.query.games.findMany(),
          db.query.team.findMany(),
        ]);

        const teamById = new Map(teams.map((t) => [t.id, t]));

        // Filter to fixtures involving the active team (if set)
        const relevantFixtures = activeTeamId
          ? fixtures.filter((f) => f.homeTeamId === activeTeamId || f.awayTeamId === activeTeamId)
          : fixtures;

        const fixtureList: FixtureListSummary[] = relevantFixtures.map((f) => {
            // Determine win/loss dynamically from activeTeamId; fall back to deprecated isAppTeamWin
            const isMyTeamHome = activeTeamId ? f.homeTeamId === activeTeamId : f.isAppTeamWin;
            const myTeamWon = (game: typeof games[number]) =>
              activeTeamId
                ? (isMyTeamHome ? game.homeTeamScore > game.awayTeamScore : game.awayTeamScore > game.homeTeamScore)
                : game.isAppTeamWin;

            return {
              ...f,
              homeTeam: (f.homeTeamId ? teamById.get(f.homeTeamId)?.name : null) ?? f.homeTeam,
              awayTeam: (f.awayTeamId ? teamById.get(f.awayTeamId)?.name : null) ?? f.awayTeam,
              matchDate: formatDate(f.matchDate),
              createdAt: formatDate(f.createdAt),
              updatedAt: formatDate(f.updatedAt),
              teamGameResult: (() => {
                const teamGame = games.find(g => g.fixtureId === f.id && g.gameType === "Team Game");
                if (!teamGame) return "N/A";
                return myTeamWon(teamGame) ? "Win" : "Loss";
              })(),
              doublesGameResult: (() => {
                const doublesGame = games.filter(g => g.fixtureId === f.id && g.gameType === "Doubles");
                if (!doublesGame.length) return "N/A";
                return `Won ${doublesGame.filter(myTeamWon).length} out of ${doublesGame.length}`;
              })(),
              singlesGameResult: (() => {
                const singlesGame = games.filter(g => g.fixtureId === f.id && g.gameType === "Singles");
                if (!singlesGame.length) return "N/A";
                return `Won ${singlesGame.filter(myTeamWon).length} out of ${singlesGame.length}`;
              })(),
            };
        });

        return { success: fixtureList };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture" };
    }

}