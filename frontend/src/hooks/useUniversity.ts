import { useUniversities } from "./useUniversities";

export const useUniversity = (id: string) => {
    const {data, isLoading, error} = useUniversities();

    const university = data?.find((university) => university.id === id);

    return {
        university,
        isLoading,
        error
    }
}