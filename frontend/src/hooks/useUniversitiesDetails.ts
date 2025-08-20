import { useQuery } from "@tanstack/react-query";
import z from "zod";

/**
 *
 * [
        {
            "program": "Комп'ютерні науки",
            "university": "Національний університет \"Києво-Могилянська академія\""
        }
    ],
 */
const schema = z.record(z.string(), z.array(z.object({
    program: z.string(),
    university: z.string(),
    programId: z.string(),
    universityId: z.string(),
})));

export const useUniversitiesDetails = (programId: string) => {
    return useQuery({
        queryKey: ['useUniversitiesDetails-data', programId],
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        queryFn: async () => {
          const response = await fetch(`/api/universities/${programId}`)
          const data = await response.json()

          const parsedData = schema.parse(data);
          return parsedData;
        },
      })
}