"use server"

import { createSafeActionClient } from "next-safe-action"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET!)
const actionClient = createSafeActionClient();
import { currentUser } from "@clerk/nextjs/server";
import { paymentIntentSchema } from "@/types/create-intent-schema";


//give this a return type of { success: { paymentIntentID: string, clientSecretID: string, user: string } } | { error: string }
export const createPaymentIntent = actionClient
  .schema(paymentIntentSchema)
  .action(async ({ parsedInput: { amount, currency } }): Promise<
    | { success: { paymentIntentID: string; clientSecretID: string | null; user: string } }
    | { error: string }
  > => {
    const user = await currentUser();
    if (!user) return { error: "Please login to continue" };
    if (!amount) return { error: "No Amount to checkout" };
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: "Darts App Payment",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return {
      success: {
        paymentIntentID: paymentIntent.id,
        clientSecretID: paymentIntent.client_secret,
        user: user.emailAddresses[0].emailAddress ?? "unknown@example.com",
      },
    };
  });
