import * as z from "zod";

export const playerSchema = z.object({
  id: z.number().optional(),
  name: z.string().max(255, {  message: "Name is required", }),
  nickname: z.string().max(100).optional(),
  team:z.string().max(100).optional()
  //issuedBy: z.string().max(255).optional(),
});


export type zPlayerSchema = z.infer<typeof playerSchema>