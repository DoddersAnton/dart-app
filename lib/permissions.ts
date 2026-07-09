import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/server";
import { eq, and } from "drizzle-orm";
import { players, playerTeams } from "@/server/schema";

export type TeamRole = "player" | "vice_captain" | "treasurer" | "secretary" | "captain";

/** Internal: the current user's player row (includes isLeagueAdmin), or null. */
async function getCurrentPlayer() {
  const { userId } = await auth();
  if (!userId) return null;
  return (await db.query.players.findFirst({ where: eq(players.userid, userId) })) ?? null;
}

export async function getActiveTeamId(): Promise<number | null> {
  const player = await getCurrentPlayer();
  if (!player) return null;

  const memberships = await db.query.playerTeams.findMany({
    where: eq(playerTeams.playerId, player.id),
  });
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const v = cookieStore.get("active-team-id")?.value;
  const cookieTeamId = v ? parseInt(v) : null;

  // Only honour the cookie when the current user actually belongs to that team.
  // The cookie is not cleared on sign-out, so a stale value from a previous
  // user/session would otherwise leak another team's data even though the nav
  // bar (which validates membership) shows the correct fallback team.
  if (cookieTeamId && memberships.some((m) => m.teamId === cookieTeamId)) {
    return cookieTeamId;
  }

  const fallback = memberships.find((m) => m.isDefault) ?? memberships[0];
  return fallback.teamId;
}

/** Returns the current user's role for the active team, or null if not determinable. */
export async function getActiveUserRole(): Promise<TeamRole | null> {
  const player = await getCurrentPlayer();
  if (!player) return null;

  const activeTeamId = await getActiveTeamId();
  if (!activeTeamId) return null;

  const membership = await db.query.playerTeams.findFirst({
    where: and(eq(playerTeams.playerId, player.id), eq(playerTeams.teamId, activeTeamId)),
  });

  return (membership?.role as TeamRole) ?? null;
}

/** App-wide league administrator — full access across all teams. DB-set only. */
export async function isLeagueAdmin(): Promise<boolean> {
  const player = await getCurrentPlayer();
  return player?.isLeagueAdmin ?? false;
}

/** League-admin gate: throws unless the current user is a league administrator. */
export async function requireLeagueAdmin(): Promise<void> {
  if (!(await isLeagueAdmin())) {
    throw new Error("Permission denied — league admin role required");
  }
}

/** Returns true when the current user is a captain on the active team (or a league admin). */
export async function isCaptain(): Promise<boolean> {
  if (await isLeagueAdmin()) return true;
  return (await getActiveUserRole()) === "captain";
}

/** Returns true for team admins: captain, secretary, or league admin. */
export async function isTeamAdmin(): Promise<boolean> {
  if (await isLeagueAdmin()) return true;
  const role = await getActiveUserRole();
  return role === "captain" || role === "secretary";
}

/**
 * Captain-level gate: captain or league admin.
 * Use for member-role management, deletes, and editing other players' profiles.
 */
export async function requireCaptain(): Promise<void> {
  if (await isLeagueAdmin()) return;
  if ((await getActiveUserRole()) !== "captain") {
    throw new Error("Permission denied — captain role required");
  }
}

/**
 * Team-admin gate: captain, secretary, or league admin.
 * Use for team-data management (fixtures, locations, seasons, awards, team
 * settings, photos/sponsors), creating players, and approving join requests.
 */
export async function requireTeamAdmin(): Promise<void> {
  if (await isLeagueAdmin()) return;
  const role = await getActiveUserRole();
  if (role !== "captain" && role !== "secretary") {
    throw new Error("Permission denied — team admin role required");
  }
}

/**
 * Finance gate: captain, secretary, treasurer, or league admin.
 * Use for fines and payment-record management.
 */
export async function requireFinanceAccess(): Promise<void> {
  if (await isLeagueAdmin()) return;
  const role = await getActiveUserRole();
  if (role !== "captain" && role !== "secretary" && role !== "treasurer") {
    throw new Error("Permission denied — finance access required");
  }
}

/**
 * Whether the current user may edit a given player's profile.
 * Own profile, captain, or league admin — secretaries cannot edit others.
 */
export async function canEditPlayerProfile(targetPlayerId: number): Promise<boolean> {
  const player = await getCurrentPlayer();
  if (!player) return false;
  if (player.id === targetPlayerId) return true;
  if (player.isLeagueAdmin) return true;
  return (await getActiveUserRole()) === "captain";
}

/**
 * Returns the linked player ID for the current user, or null if not linked.
 * Used to gate "edit own profile" rights.
 */
export async function getLinkedPlayerId(): Promise<number | null> {
  const player = await getCurrentPlayer();
  return player?.id ?? null;
}
