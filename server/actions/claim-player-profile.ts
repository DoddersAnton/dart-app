"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { players, playerTeams } from "../schema";

/**
 * Links an existing (unlinked) player profile to the current Clerk user.
 * Returns whether the claimed profile already has a team membership (i.e. a
 * captain pre-linked it) so the onboarding flow can skip the join-request step.
 */
export async function claimPlayerProfile(
  playerId: number
): Promise<{ success: true; hasTeam: boolean } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  try {
    const player = await db.query.players.findFirst({ where: eq(players.id, playerId) });
    if (!player) return { error: "Player not found" };
    if (player.userid && player.userid !== userId) {
      return { error: "This profile is already linked to another account" };
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? null;

    await db.update(players).set({ userid: userId, userEmail: email }).where(eq(players.id, playerId));

    const memberships = await db.query.playerTeams.findMany({ where: eq(playerTeams.playerId, playerId) });
    const hasTeam = memberships.length > 0;

    if (hasTeam) {
      const defaultTeam = memberships.find((m) => m.isDefault) ?? memberships[0];
      const cookieStore = await cookies();
      cookieStore.set("active-team-id", String(defaultTeam.teamId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    revalidatePath("/");
    return { success: true, hasTeam };
  } catch (error) {
    console.error(error);
    return { error: "Failed to claim profile" };
  }
}
