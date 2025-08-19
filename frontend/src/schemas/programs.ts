import z from "zod";

export const programsSchema = z.object({
    programs: z.object({
      id: z.string(),
      website: z.string(),
      url: z.string(),
      timestamp: z.string(),
      university: z.string(),
      speciality: z.string(),
      programName: z.string(),
      amounts: z.object({
        totalPlaces: z.string(),
        contractPlaces: z.string(),
        budgetPlaces: z.string()
      }),
      table: z.array(z.object({
        name: z.string(),
        priority: z.string(),
        state: z.string(),
        marks: z.string(),
        type: z.string()
      })),
    }).array()
  })

export type ProgramsType = z.infer<typeof programsSchema>;