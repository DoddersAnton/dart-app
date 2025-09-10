import * as z from "zod";

export const createPlayerFineSchema = z.object({
  id: z.number().optional(),
  playerId: z.number().int().positive({
    message: "Player is required",
  }),
  fineId: z.number().int().positive({
    message: "Fine is required",
  }),
  matchDate: z
    .z.date(),
  notes: z.string().max(1000).optional(),
  quantity: z.coerce.number(),
  //issuedBy: z.string().max(255).optional(),
});

export type zPlayerFineSchema = z.infer<typeof createPlayerFineSchema>