import { useQuery } from "@tanstack/react-query";
import { programsSchema } from "../schemas/programs";

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

          const parsedData = programsSchema.parse(data);
          return parsedData;
        },
        select: (data) => {
            return data.programs.map(program => ({
                ...program,
                data: {
                    ...program,
                }
            }))
        }

      })
}