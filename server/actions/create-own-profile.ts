"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { players } from "../schema";

/**
 * Self-service profile creation during onboarding, when no existing profile is
 * available to claim. Creates a player and links it to the current Clerk user.
 * No team membership is created — the user must request to join a team.
 */
export async function createOwnProfile(values: {
  name: string;
  nickname?: string | null;
  dateOfBirth?: string | null;
}): Promise<{ success: true; playerId: number } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  if (!values.name.trim()) return { error: "Name is required" };

  try {
    // Guard against creating a second profile for the same account.
    const existing = await db.query.players.findFirst({ where: eq(players.userid, userId) });
    if (existing) return { success: true, playerId: existing.id };

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? null;

    const [created] = await db
      .insert(players)
      .values({
        name: values.name.trim(),
        nickname: values.nickname?.trim() || undefined,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
        userid: userId,
        userEmail: email,
        createdAt: new Date(),
      })
      .returning();

    revalidatePath("/");
    return { success: true, playerId: created.id };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create profile" };
  }
}
