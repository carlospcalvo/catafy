import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDescription } from '#/lib/api'

export function useAddDescription(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (description: string) => addDescription(token, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}
