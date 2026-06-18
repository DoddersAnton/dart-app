import { z } from "zod";

export const addGameRoundsSchema = z.object({
  gameId: z.number().optional(),
  gameRounds: z.array(z.object({
    roundNo: z.coerce.number(),
    roundLeg: z.coerce.number(),
    homeTeamScore: z.coerce.number(),
    awayTeamScore: z.coerce.number(),
    // @deprecated — kept for compatibility; prefer homePlayerId/awayPlayerId
    playerId: z.number().optional(),
    homePlayerId: z.number().optional(),
    awayPlayerId: z.number().optional(),
    homeDartsUsed: z.number().optional(),
    awayDartsUsed: z.number().optional(),
  })),
  
});

export type zGameRoundsSchema = z.infer<typeof addGameRoundsSchema>;
