import * as z from "zod";

export const createAwardSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(255, { message: "Title is required" }),
  description: z.string().max(500).optional(),
});

export type zAwardSchema = z.infer<typeof createAwardSchema>;
