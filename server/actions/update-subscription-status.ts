"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { subscriptions } from "../schema";
import { requireTeamAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Mark a single subscription Paid / Unpaid.
export async function updateSubscriptionStatus(params: {
  id: number;
  status: "Paid" | "Unpaid";
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireTeamAdmin();
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
