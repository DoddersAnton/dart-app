import * as z from "zod";

export const createMulitplePlayerFineSchema = z.object({
  playerIds: z.array(z.number().int().positive()).nonempty({
    message: "At least one player is required",
  }),
  fineId: z.number().int().positive({
    message: "Fine is required",
  }),
  matchDate: z
    .z.date(),
  notes: z.string().max(1000).optional(),
  //issuedBy: z.string().max(255).optional(),
});

export type zMulitplePlayerFineSchema = z.infer<typeof createMulitplePlayerFineSchema>