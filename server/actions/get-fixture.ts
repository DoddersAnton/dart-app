"use server"

import { eq } from "drizzle-orm";
import { db } from ".."
import { getSeason } from "./get-season";
import { getLocation } from "./get-location";
import { getTeam } from "./get-team";


export async function getFixture(id: number) {
    try {
        const fixture = await db.query.fixtures.findFirst({
            where: (fixture) => eq(fixture.id, id),
        });

        if (!fixture) throw new Error(`Fixture not found ${id}`);

        const fixtureSeason = await getSeason(fixture.seasonsId ?? 0);
        const fixtureLocation = await getLocation(fixture.matchLocationId ?? 0);
        const fixtureHomeTeam = await getTeam(fixture.homeTeamId ?? 0);
        const fixtureAwayTeam = await getTeam(fixture.awayTeamId ?? 0);

        const fixtureWithReferences = {
            ...
            fixture,
            season: fixture.season ? fixture.season : (fixtureSeason.success ? fixtureSeason.success?.name : undefined),
            location: fixture.matchLocation ? fixture.matchLocation : (fixtureLocation.success ? fixtureLocation.success.name : undefined),
            awayTeam: fixture.awayTeam ? fixture.awayTeam : (fixtureAwayTeam.success ? fixtureAwayTeam.success.name : 'Unknown Team'),
            homeTeam: fixture.homeTeam ? fixture.homeTeam : (fixtureHomeTeam.success ? fixtureHomeTeam.success.name : 'Unknown Team'),
            isAppTeamWin: fixture.isAppTeamWin ? fixture.isAppTeamWin : (fixture.homeTeamId === 1 
                ? (fixture.homeTeamScore > fixture.awayTeamScore) 
                : (fixture.awayTeamScore > fixture.homeTeamScore))
        }

        return { success: fixtureWithReferences } 
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture" };
    }
}