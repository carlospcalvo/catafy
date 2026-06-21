import { useQuery } from '@tanstack/react-query'
import { fetchLists } from '#/lib/api'

export function useLists(token: string | null) {
  return useQuery({
    queryKey: ['lists', token],
    queryFn: () => fetchLists(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })
}
