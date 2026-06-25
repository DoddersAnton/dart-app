import * as z from "zod";

export const subscriptionSchema = z.object({
  subscriptionType: z
    .string()
    .max(255, { message: "Subscription type is required" }),
  season: z.string().max(255, { message: "Season is required" }),
  description: z.string().max(255, { message: "Description is required" }),
  amount: z.coerce.number().positive(),
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

// Used when raising a subscription for a whole team. Dates are derived from the
// chosen season server-side, so there are no past/future date constraints here.
export const teamSubscriptionSchema = z.object({
  subscriptionType: z.string().min(1, { message: "Type is required" }).max(255),
  season: z.string().min(1, { message: "Season is required" }).max(255),
  description: z.string().max(255).optional(),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
});

export type zTeamSubscriptionSchema = z.infer<typeof teamSubscriptionSchema>;

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
