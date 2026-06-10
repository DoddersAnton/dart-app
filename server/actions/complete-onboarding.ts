"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "..";
import { players, playerTeams } from "../schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(
  playerId: number,
  teamIds: number[],
  defaultTeamId: number
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  if (!teamIds.length) return { error: "Select at least one team" };

  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? null;

    // Link player to this Clerk user
    await db.update(players)
      .set({ userid: userId, userEmail: email })
      .where(eq(players.id, playerId));

    // Create player-team memberships (skip duplicates)
    for (const teamId of teamIds) {
      const existing = await db.query.playerTeams.findFirst({
        where: and(eq(playerTeams.playerId, playerId), eq(playerTeams.teamId, teamId)),
      });
      if (!existing) {
        await db.insert(playerTeams).values({
          playerId,
          teamId,
          isDefault: teamId === defaultTeamId,
        });
      }
    }

    // Set active team cookie
    const cookieStore = await cookies();
    cookieStore.set("active-team-id", String(defaultTeamId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to complete setup" };
  }
}
