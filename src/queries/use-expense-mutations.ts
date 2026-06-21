import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense, deleteExpense } from '#/lib/api'
import type { ExpenseFormData } from '#/types/expense'

export function useCreateExpense(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExpenseFormData) => createExpense(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] })
    },
  })
}

export function useUpdateExpense(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseFormData }) =>
      updateExpense(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] })
    },
  })
}

export function useDeleteExpense(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] })
    },
  })
}
