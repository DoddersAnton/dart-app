import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/server";
import { eq, and } from "drizzle-orm";
import { players, playerTeams } from "@/server/schema";

export type TeamRole = "captain" | "player";

/** Returns the current user's role for the active team, or null if not determinable. */
export async function getActiveUserRole(): Promise<TeamRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;
  if (!activeTeamId) return null;

  const player = await db.query.players.findFirst({ where: eq(players.userid, userId) });
  if (!player) return null;

  const membership = await db.query.playerTeams.findFirst({
    where: and(eq(playerTeams.playerId, player.id), eq(playerTeams.teamId, activeTeamId)),
  });

  return (membership?.role as TeamRole) ?? null;
}

/** Returns true only when the current user is a captain on the active team. */
export async function isCaptain(): Promise<boolean> {
  return (await getActiveUserRole()) === "captain";
}

/**
 * Throws a permission error if the current user is not a captain.
 * Use at the top of server actions that require elevated access.
 */
export async function requireCaptain(): Promise<void> {
  const role = await getActiveUserRole();
  if (role !== "captain") {
    throw new Error("Permission denied — captain role required");
  }
}

/**
 * Returns the linked player ID for the current user, or null if not linked.
 * Used to gate "edit own profile" rights.
 */
export async function getLinkedPlayerId(): Promise<number | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const player = await db.query.players.findFirst({ where: eq(players.userid, userId) });
  return player?.id ?? null;
}
