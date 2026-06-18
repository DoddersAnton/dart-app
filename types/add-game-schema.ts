import { z } from "zod";

export const addGameSchema = z
  .object({
    id: z.number().optional(),
    fixtureId: z.number().optional(),
    homeTeamScore: z.coerce.number(),
    awayTeamScore: z.coerce.number(),
    gameType: z.string().max(250, {
      message: "Away team is required",
    }),
    // Home roster (real player records). At least one player overall is required.
    homePlayerList: z.array(z.number().int().positive()),
    // Away roster — may be empty when the opponent isn't an app team (free-text fallback in the tracker).
    awayPlayerList: z.array(z.number().int().positive()),
  })
  .refine(
    (v) => v.homePlayerList.length + v.awayPlayerList.length > 0,
    { message: "At least one player is required", path: ["homePlayerList"] }
  )
  .refine(
    (v) => !v.homePlayerList.some((id) => v.awayPlayerList.includes(id)),
    { message: "A player can't be on both teams", path: ["awayPlayerList"] }
  );

export type zGameSchema = z.infer<typeof addGameSchema>;
