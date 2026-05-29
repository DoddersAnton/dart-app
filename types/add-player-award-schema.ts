import * as z from "zod";

export const createPlayerAwardSchema = z.object({
  id: z.number().optional(),
  playerId: z.number(),
  awardId: z.number(),
  seasonId: z.number().optional(),
  notes: z.string().max(500).optional(),
  awardedAt: z.string().optional(),
});

export type zPlayerAwardSchema = z.infer<typeof createPlayerAwardSchema>;
