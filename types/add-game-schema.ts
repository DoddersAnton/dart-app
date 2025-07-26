import { z } from "zod";

export const addGameSchema = z.object({
  id: z.number().optional(),
  fixtureId: z.number().optional(),
  homeTeamScore: z.coerce.number(),
  awayTeamScore: z.coerce.number(),
  gameType: z.string().max(250, {
    message: "Away team is required",
  }),
  playerList: z.array(z.number().int().positive()).nonempty({
    message: "At least one player is required",
  }),
});

export type zGameSchema = z.infer<typeof addGameSchema>;
