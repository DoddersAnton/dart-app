import * as z from "zod";

/*
export const createFixtureSchema = z.object({
  id: z.number().optional(),
  homeTeam: z.string().max(250, {
    message: "Home team is required",
  }),
  awayTeam: z.string().max(250, {
    message: "Away team is required",
  }),
  homeTeamScore: z
    .number()
    .int()
    .min(0, {
      message: "Home team score must be a non-negative integer",
    })
    .optional()
    .default(0),
  awayTeamScore: z
    .number()
    .int()
    .min(0, {
      message: "Away team score must be a non-negative integer",
    })
    .optional()
    .default(0),
  matchLocation: z.string().max(255, {
    message: "Match location is required",
  }),
  league: z.string().max(255, {
    message: "League is required",
  }),
  season: z.string().max(255, {
    message: "Season is required",
  }),
  matchStatus: z.string().max(255, {
    message: "Match status is required",
  }),
  matchDate: z.z.date(),
});
*/

export const createFixtureSchema = z.object({
  

  homeTeamId: z.number(),
  awayTeamId: z.number(),
  matchLocationId: z.number(),
  league: z.string().max(255, {
    message: "League is required",
  }),
  seasonId: z.number(),
  matchStatus: z.string().max(255, {
    message: "Match status is required",
  }),
  matchDate: z.date(),
  id: z.number().optional(),
  homeTeamScore: z.coerce.number(),
  awayTeamScore: z.coerce.number(),
});

export type zFixtureSchema = z.infer<typeof createFixtureSchema>;
