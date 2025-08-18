import { useMutation } from "@tanstack/react-query";

export const useUpdateData = () => {
    return useMutation({
        mutationFn: async () => {
          const response = await fetch('/api/get-unis', {
            method: 'POST',
          })
          if (!response.ok) {
            throw new Error('Failed to update data')
          }
          return response.json()
        },
        onSuccess: () => {
          // Reload the page on success
          window.location.reload()
        },
        onError: (error) => {
          console.error('Update failed:', error)
          alert('Failed to update data. Please try again.')
        }
      })
}