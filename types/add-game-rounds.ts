import { z } from "zod";

export const addGameRoundsSchema = z.object({
  gameId: z.number().optional(),
  gameRounds: z.array(z.object({
    roundNo: z.coerce.number(),
    roundLeg: z.coerce.number(),
    homeTeamScore: z.coerce.number(),
    awayTeamScore: z.coerce.number(),
    playerId: z.number().optional()
  })),
  
});

export type zGameRoundsSchema = z.infer<typeof addGameRoundsSchema>;
