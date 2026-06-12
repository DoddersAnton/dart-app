"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getPlayerByUserId } from "./get-player-by-user-id";
import { getPlayerTeams } from "./get-player-teams";

export async function restoreActiveTeam(): Promise<{ teamId: number } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const player = await getPlayerByUserId(userId);
  if (!player) return { error: "No player linked" };

  const teams = await getPlayerTeams(player.id);
  if (!teams.length) return { error: "No teams found" };

  const defaultTeam = teams.find((t) => t.isDefault) ?? teams[0];

  const cookieStore = await cookies();
  cookieStore.set("active-team-id", String(defaultTeam.teamId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { teamId: defaultTeam.teamId };
}
