"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fixtures } from "../schema";
import { createFixtureSchema } from "@/types/add-fixture-schema";

const actionClient = createSafeActionClient();

export const createFixture = actionClient
.schema(createFixtureSchema)
.action(async ({ parsedInput: { id, homeTeam, homeTeamScore, awayTeam, awayTeamScore, matchDate, matchLocation, matchStatus, 
season, league
 } }) => {
    try {
      

    if(id) {

        const existingFiture = await db.query.fixtures.findFirst({
          where: eq(fixtures.id, id),
        });

        if (!existingFiture) return { error: "Fixture not found" };

        await db
          .update(fixtures)
          .set({
           homeTeam: homeTeam ?? existingFiture.homeTeam,
           awayTeam: awayTeam ?? existingFiture.awayTeam,
            homeTeamScore: homeTeamScore ?? 0,
            awayTeamScore: awayTeamScore ?? 0,
            matchLocation: matchLocation ?? existingFiture.matchLocation,
            matchStatus: matchStatus ?? existingFiture.matchStatus,
            matchDate: matchDate ?? existingFiture.matchDate,
            league: league ?? existingFiture.league,
            season: season ?? existingFiture.season,
            updatedAt: new Date(),
          })
          .where(id ? eq(fixtures.id, id) : undefined)
          .returning();

          

        revalidatePath("/fixtures/add-fixture");
        return { success: `Fixture at ${matchLocation} on ${matchDate} has been updated` };
      }

      await db
      .insert(fixtures)
      .values({
        homeTeam: homeTeam ?? undefined,
        awayTeam: awayTeam ?? undefined,
        homeTeamScore: homeTeamScore ?? 0,
        awayTeamScore: awayTeamScore ?? 0,
        matchLocation: matchLocation ?? undefined,
        matchStatus: matchStatus ?? undefined,
        matchDate: matchDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        league: league, // Provide appropriate value or get from input
        season: season, // Provide appropriate value or get from input
      })
      .returning();
      revalidatePath("/fixtures/add-fixture");
     return { success: `Fixture at ${matchLocation} on ${matchDate} has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
