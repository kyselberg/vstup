import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const useUniversities = () => {
    return useQuery({
        queryKey: ['admission-data'],
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        queryFn: async () => {
          const response = await fetch('/api/universities')
          const data = await response.json()
          const schema = z.object({
            universities: z.object({
              id: z.string(),
              website: z.string(),
              url: z.string().url(),
              timestamp: z.string().datetime(),
              data: z.object({
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
                university: z.string(),
                speciality: z.string(),
                programName: z.string()
              })
            }).array()
          })

          const parsedData = schema.parse(data);
          return parsedData;
        },
        select: (data) => {
            return data.universities.map(university => ({
                ...university,
                data: {
                    ...university.data,
                    table: university.data.table.filter(row => row.state !== '').sort((a, b) => {
                        // Sort budget applicants first, then contract applicants
                        if (a.type === 'Б' && b.type === 'К') return -1;
                        if (a.type === 'К' && b.type === 'Б') return 1;
                        return 0;
                    })
                }
            }))
        }

      })
}