import * as z from "zod";

export const addPaymentSchema = z.object({
  playerId: z.number().int().positive({
    message: "Player is required",
  }),
  amount: z.number().positive({
    message: "Amount must be a positive number",
  }),
    paymentMethod: z.string().max(255, {
        message: "Payment method must be at most 255 characters",
    }),
    paymentType: z.enum(["Fine", "Sub","Combined", "Other"]).default("Fine"),
    paymentStatus: z.enum(["Pending", "Completed", "Failed"]).default("Pending"),
    transactionId: z.string().max(255).optional(), 
    fineList: z.array(z.number().int().positive()).optional().default([]),
    subList: z.array(z.number().int().positive()).optional().default([]),
});


export type zAddPaymentSchema = z.infer<typeof addPaymentSchema>