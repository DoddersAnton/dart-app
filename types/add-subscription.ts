import * as z from "zod";

export const subscriptionSchema = z.object({
  subscriptionType: z
    .string()
    .max(255, { message: "Subscription type is required" }),
  season: z.string().max(255, { message: "Season is required" }),
  description: z.string().max(255, { message: "Description is required" }),
  amount: z
    .number()
    .min(0, { message: "Amount must be a positive number" })
    .default(0.0),
  startDate: z
    .date()
    .refine((date) => date <= new Date(), {
      message: "Start date must be in the past or present",
    }),
  endDate: z
    .date()
    .refine((date) => date > new Date(), {
      message: "End date must be in the future",
    }),
});

export type zsubscriptionSchema = z.infer<typeof subscriptionSchema>;

export const updateSubscriptionSchema = subscriptionSchema.partial().extend({
  id: z.number().optional(),
  playerId: z
    .number()
    .int()
    .positive()
    .max(999999, { message: "Player ID must be a positive integer" }),
  status: z.enum(["Unpaid", "Paid"]).default("Unpaid"),
});

export type zUpdateSubscriptionSchema = z.infer<
  typeof updateSubscriptionSchema
>;
