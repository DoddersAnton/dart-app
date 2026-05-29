import * as z from "zod";

export const playerSchema = z.object({
  id: z.number().optional(),
  name: z.string().max(255, { message: "Name is required" }),
  nickname: z.string().max(100).optional(),
  team: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  dartsUsed: z.string().max(255).optional(),
  dartsWeight: z.coerce.number().positive().optional(),
  dateOfBirth: z.string().optional(),
});

export type zPlayerSchema = z.infer<typeof playerSchema>;