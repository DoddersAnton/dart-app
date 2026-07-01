import { z } from "zod";

export const addSeasonSchema = z.object({
  id: z.number().optional(),
    name: z.string().max(255, { 
    message: "Season name is required",
    }),
    startDate: z.date(),
    endDate: z.date(),
    // The preceding season (optional).
    lastSeasonId: z.number().int().positive().nullable().optional(),

});

export type zSeasonSchema = z.infer<typeof addSeasonSchema>;