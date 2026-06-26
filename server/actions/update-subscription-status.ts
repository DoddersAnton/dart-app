"use server";

import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "..";
import { subscriptions, playerTeams } from "../schema";
import { requireTeamAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Mark a single subscription Paid / Unpaid.
export async function updateSubscriptionStatus(params: {
  id: number;
  status: "Paid" | "Unpaid";
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireTeamAdmin();

    const cookieStore = await cookies();
    const activeTeamId = cookieStore.get("active-team-id")?.value
      ? parseInt(cookieStore.get("active-team-id")!.value)
      : null;
    if (!activeTeamId) return { error: "No active team selected" };

    const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, params.id) });
    if (!sub) return { error: "Subscription not found" };

    const membership = await db.query.playerTeams.findFirst({
      where: and(eq(playerTeams.teamId, activeTeamId), eq(playerTeams.playerId, sub.playerId)),
    });
    if (!membership) return { error: "Permission denied — subscription not in active team" };

    await db
      .update(subscriptions)
      .set({ status: params.status, updatedAt: new Date() })
      .where(eq(subscriptions.id, params.id));
    revalidatePath("/settings/team-subscriptions");
    return { success: `Marked ${params.status}` };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
    console.error("updateSubscriptionStatus error:", error);
    return { error: "Failed to update subscription" };
  }
}
