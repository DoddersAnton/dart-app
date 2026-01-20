import { z } from "zod";

export const addTeamSchema = z.object({
  id: z.number().optional(),
    name: z.string().max(250, {     
    message: "Team name is required",
    }),
    defaultLocationId: z.number().optional().nullable(),
    isAppTeam: z.boolean().optional(),
});

export type zTeamSchema = z.infer<typeof addTeamSchema>;