"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fixtures, locations, seasons, team } from "../schema";
import { createFixtureSchema } from "@/types/add-fixture-schema";

const actionClient = createSafeActionClient();

export const createFixture = actionClient
.schema(createFixtureSchema)
.action(async ({ parsedInput: { id, homeTeamId, 
  homeTeamScore, awayTeamId, awayTeamScore, matchDate, matchLocationId, matchStatus, 
seasonId, league
 } }) => {
    try {

      console.log("Creating fixture with data:", { id, homeTeamId, 
        homeTeamScore, awayTeamId, awayTeamScore, matchDate, matchLocationId, matchStatus, 
      seasonId, league });

      if(!homeTeamId && !awayTeamId) {
        return { error: "At least one of Home Team or Away Team must be selected from the team list" };
      }


      const awayTeam = await db.query.team.findFirst({
        where: eq(team.id, awayTeamId ?? 0),
      });

      if(!awayTeam) {
        return { error: "Away Team not found" };
      }

      const homeTeam = await db.query.team.findFirst({
        where: eq(team.id, homeTeamId ?? 0),
      }); 

      if(!homeTeam) {
        return { error: "Home Team not found" };
      }

      const isSameTeam = homeTeam.id === awayTeam.id;

      if(isSameTeam) {
        return { error: "Home Team and Away Team cannot be the same" };
      }

      const isAppTeamWin = 
        (awayTeam.isAppTeam && awayTeamScore > homeTeamScore) ||
        (homeTeam.isAppTeam && homeTeamScore > awayTeamScore);

      const location = await db.query.locations.findFirst({
        where: eq(locations.id, matchLocationId ?? homeTeam.defaultLocationId),
      })

      if(!location)
      {
        return { error: "Location required"}
        
      }

      const season = await db.query.seasons.findFirst({
        where: eq(seasons.id, seasonId),
      })

      if(!season)
      {
        return { error: "Season required"}
      }
      

    if(id) {

        const existingFiture = await db.query.fixtures.findFirst({
          where: eq(fixtures.id, id),
        });

        if (!existingFiture) return { error: "Fixture not found" };

        await db
          .update(fixtures)
          .set({
           homeTeam: homeTeam.name ?? existingFiture.homeTeam,
           homeTeamId: homeTeamId ?? existingFiture.homeTeamId,
           awayTeamId: awayTeamId ?? existingFiture.awayTeamId,
           awayTeam: awayTeam.name ?? existingFiture.awayTeam,
            homeTeamScore: homeTeamScore ?? 0,
            awayTeamScore: awayTeamScore ?? 0,
            matchLocation: location.name ?? existingFiture.matchLocation,
            matchLocationId: location.id ?? existingFiture.matchLocationId,
            matchStatus: matchStatus ?? existingFiture.matchStatus,
            matchDate: matchDate ?? existingFiture.matchDate,
            league: league ?? existingFiture.league,
            season: season.name ?? existingFiture.season,
            seasonsId: season.id ?? existingFiture.seasonsId,
            updatedAt: new Date(),
            isAppTeamWin: isAppTeamWin,
          })
          .where(id ? eq(fixtures.id, id) : undefined)
          .returning();

          

        revalidatePath("/fixtures/add-fixture");
        return { success: `Fixture at ${location.name} on ${matchDate.getDay()}/${matchDate.getMonth()}/${matchDate.getFullYear()} has been updated` };
      }

      await db
      .insert(fixtures)
      .values({
        homeTeam: homeTeam.name ?? undefined,
        awayTeam: awayTeam.name ?? undefined,
        homeTeamScore: homeTeamScore ?? 0,
        awayTeamScore: awayTeamScore ?? 0,
        matchLocation: location.name ?? undefined,
        matchLocationId: location.id ?? undefined,
        matchStatus: matchStatus ?? undefined,
        matchDate: matchDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        league: league, 
        season: season.name, 
        seasonsId: seasonId,
        homeTeamId: homeTeamId ?? undefined,
        awayTeamId: awayTeamId ?? undefined,
        isAppTeamWin: isAppTeamWin,
      })
      .returning();
      revalidatePath("/fixtures/add-fixture");

      // or each play create a subscription to the fixture

     return { success: `Fixture at ${location.name} on ${matchDate.getDay()}/${matchDate.getMonth()}/${matchDate.getFullYear()} has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
