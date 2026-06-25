"use server";
import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "..";
import { revalidatePath } from "next/cache";
import { subscriptions, playerTeams, seasons } from "../schema";
import { teamSubscriptionSchema } from "@/types/add-subscription";
import { requireTeamAdmin } from "@/lib/permissions";

const actionClient = createSafeActionClient();

// Raise a subscription for the active team — one row per team player (status Unpaid).
// Start/end dates are taken from the chosen season.
export const createTeamSubscription = actionClient
  .schema(teamSubscriptionSchema)
  .action(async ({ parsedInput: { subscriptionType, season, amount, description } }) => {
    try {
      await requireTeamAdmin();

      const cookieStore = await cookies();
      const activeTeamId = cookieStore.get("active-team-id")?.value
        ? parseInt(cookieStore.get("active-team-id")!.value)
        : null;
      if (!activeTeamId) return { error: "No active team selected" };

      const memberships = await db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) });
      const playerIds = [...new Set(memberships.map((m) => m.playerId))];
      if (playerIds.length === 0) return { error: "No players on the active team" };

      const seasonRecord = await db.query.seasons.findFirst({ where: eq(seasons.name, season) });
      const startDate = seasonRecord?.startDate ?? new Date();
      const endDate = seasonRecord?.endDate ?? new Date();

      await db.insert(subscriptions).values(
        playerIds.map((playerId) => ({
          playerId,
          subscriptionType,
          season,
          startDate,
          endDate,
          description: description ?? "",
          amount,
          status: "Unpaid",
          createdAt: new Date(),
        })),
      );

      revalidatePath("/settings/team-subscriptions");
      return { success: `Subscription raised for ${playerIds.length} player${playerIds.length !== 1 ? "s" : ""}` };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
      console.error("createTeamSubscription error:", error);
      return { error: JSON.stringify(error) };
    }
  });
