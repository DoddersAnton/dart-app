import { z } from "zod";

export const addLocationSchema = z.object({
  id: z.number().optional(),
  fixtureId: z.number().optional(),
 name: z.string().max(250, {
    message: "Location name is required",
  }),
  address: z.string().max(500, {
    message: "Address is required",
  }),
  googleMapsLink: z.string().optional().nullable(),
});

export type zLocationSchema = z.infer<typeof addLocationSchema>;