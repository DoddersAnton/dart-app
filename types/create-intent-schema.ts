import * as z from "zod"

export const paymentIntentSchema = z.object({
  amount: z.number(),
  currency: z.string(),
})