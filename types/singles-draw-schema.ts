import { z } from "zod";

// One drawn singles pairing. A side with no app roster (free-text opponent) has no player id.
const drawnMatchSchema = z
  .object({
    homePlayerId: z.number().int().positive().optional(),
    awayPlayerId: z.number().int().positive().optional(),
  })
  .refine((m) => m.homePlayerId != null || m.awayPlayerId != null, {
    message: "Each match needs at least one app player",
  });

export const singlesDrawSchema = z
  .object({
    fixtureId: z.number().int().positive(),
    matches: z.array(drawnMatchSchema).min(1).max(8),
  })
  .refine(
    (v) => {
      const ids = v.matches.flatMap((m) => [m.homePlayerId, m.awayPlayerId]).filter((id) => id != null);
      return new Set(ids).size === ids.length;
    },
    { message: "A player can only be drawn once", path: ["matches"] }
  );

export type zSinglesDrawSchema = z.infer<typeof singlesDrawSchema>;
