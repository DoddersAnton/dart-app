"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { revalidatePath } from "next/cache";
import { subscriptions } from "../schema";
import { subscriptionSchema } from "@/types/add-subscription";

const actionClient = createSafeActionClient();

export const createSubscription = actionClient
.schema(subscriptionSchema)
.action(async ({ parsedInput: { subscriptionType, season, startDate, endDate, amount, description   } }) => {
    try {
      
        const players = await db.query.players.findMany(); 
        players.forEach(async (player) => {

        await db.
         insert(subscriptions).
                values({
                playerId: player.id,
                subscriptionType: subscriptionType ?? "",
                season: season ?? "",
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
                description: description ?? "",
                amount: amount ?? 0.00,
                createdAt: new Date(),

                });
    
      }); 

        revalidatePath("/players");
        return { success: `Subscription has been created` };
     
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
