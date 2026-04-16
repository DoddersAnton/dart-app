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

export async function getFixtureList() {
 try {
        const [fixtures, games, teams] = await Promise.all([
          db.query.fixtures.findMany(),
          db.query.games.findMany(),
          db.query.team.findMany(),
        ]);

        const teamById = new Map(teams.map((t) => [t.id, t]));

        const fixtureList: FixtureListSummary[] = fixtures.map((f) => ({
            ...f,
            homeTeam: (f.homeTeamId ? teamById.get(f.homeTeamId)?.name : null) ?? f.homeTeam,
            awayTeam: (f.awayTeamId ? teamById.get(f.awayTeamId)?.name : null) ?? f.awayTeam,
            matchDate: formatDate(f.matchDate),
            createdAt: formatDate(f.createdAt),
            updatedAt: formatDate(f.updatedAt),
            teamGameResult: (() => {
                const teamGame = games.find(g => g.fixtureId === f.id && g.gameType === "Team Game");
                if (!teamGame) return "N/A";
                return teamGame.isAppTeamWin ? "Win" : "Loss";
            })(),
            doublesGameResult: (() => {
                //needs to expressed as: 1/2 (total of two games)
                const doublesGame = games.filter(g => g.fixtureId === f.id && g.gameType === "Doubles");
                if (!doublesGame || doublesGame.length === 0) return "N/A";
                return  `Won ${doublesGame.filter(c=>c.isAppTeamWin).length} out of 2`;
            })(),
            singlesGameResult: (() => {
                 //needs to expressed as: 1/4 (total of two games)
                const singlesGame = games.filter(g => g.fixtureId === f.id && g.gameType === "Singles");
                if (!singlesGame || singlesGame.length === 0) return "N/A";
                return `Won ${singlesGame.filter(c=>c.isAppTeamWin).length} out of 4`;
            })(),
        }));

        return { success: fixtureList };
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture" };
    }

}