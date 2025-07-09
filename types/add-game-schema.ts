import { z } from "zod";

export const addGameSchema = z.object(
    {
        id: z.number().optional(),
        fixtureId: z
            .number()
            .int()
            .positive()
            .max(999999, { message: "Fixture ID must be a positive integer" }),
        homeTeamScore:   z.coerce.number().positive()
            .max(999, { message: "Away team score must be a non-negative integer"
            })
            .default(0),
        awayTeamScore: 
            z.coerce.number().positive()
            .max(999, { message: "Away team score must be a non-negative integer"
            })
            .default(0),
        gameType: z.string().max(250, {
            message: "Away team is required",
          }),
            playerList: z.array(z.number().int().positive()).optional().default([]),
    }
    );


  