import * as z from "zod";

export const createFineSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(255, {  message: "Title is required", }),
  description: z.string().max(1000).optional(),
  amount: z.coerce.number().positive()
  //issuedBy: z.string().max(255).optional(),
});

export type zFineSchema = z.infer<typeof createFineSchema>