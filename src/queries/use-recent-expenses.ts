import { useQuery } from '@tanstack/react-query'
import { fetchRecentExpenses } from '#/lib/api'

export function useRecentExpenses(token: string | null) {
  return useQuery({
    queryKey: ['recent-expenses', token],
    queryFn: () => fetchRecentExpenses(token!),
    enabled: !!token,
    refetchInterval: 30_000,
  })
}
