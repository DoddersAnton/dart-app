"use server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { playerAwards } from "../schema";

export async function getPlayerAwards(playerId: number) {
  try {
    const rows = await db.query.playerAwards.findMany({
      where: eq(playerAwards.playerId, playerId),
      with: {
        award: true,
        season: true,
      },
    });

    return {
      success: rows.map((r) => ({
        id: r.id,
        playerId: r.playerId,
        awardId: r.awardId,
        seasonId: r.seasonId ?? null,
        notes: r.notes ?? null,
        awardedAt: r.awardedAt ? r.awardedAt.toISOString() : null,
        createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        award: {
          id: r.award.id,
          title: r.award.title,
          description: r.award.description ?? null,
        },
        season: r.season
          ? { id: r.season.id, name: r.season.name }
          : null,
      })),
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get player awards" };
  }
}
