import { useState, useCallback } from 'react'
import { detectWhoPaid } from '#/lib/jwt'
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '#/queries/use-expense-mutations'
import { useAddDescription } from '#/queries/use-description-mutation'
import type { Expense, ExpenseFormData } from '#/types/expense'
import { toast } from 'sonner'

export function useExpenseForm(token: string | null, onSessionExpired: () => void) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [formKey, setFormKey] = useState(0)

  const whoPaid = token ? detectWhoPaid(token) : ''

  const createMutation = useCreateExpense(token ?? '')
  const updateMutation = useUpdateExpense(token ?? '')
  const deleteMutation = useDeleteExpense(token ?? '')
  const addDescriptionMutation = useAddDescription(token ?? '')

  const mutationError =
    createMutation.error?.message ??
    updateMutation.error?.message ??
    deleteMutation.error?.message

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const isDeletePending = deleteMutation.isPending

  const handleError = useCallback(
    (err: Error) => {
      if (err.message === 'Sesión expirada') {
        onSessionExpired()
      } else {
        toast.error(err.message)
      }
    },
    [onSessionExpired],
  )

  const handleSubmit = useCallback(
    (data: ExpenseFormData) => {
      if (editingExpense) {
        updateMutation.mutate(
          { id: editingExpense.id, data },
          {
            onSuccess: () => {
              setEditingExpense(null)
              toast.success('Gasto actualizado')
            },
            onError: handleError,
          },
        )
      } else {
        createMutation.mutate(data, {
          onSuccess: () => {
            setFormKey((k) => k + 1)
            toast.success('Gasto agregado')
          },
          onError: handleError,
        })
      }
    },
    [editingExpense, updateMutation, createMutation, handleError],
  )

  const handleAddDescription = useCallback(
    (description: string) => {
      addDescriptionMutation.mutate(description, {
        onSuccess: () => toast.success('Descripción creada'),
        onError: handleError,
      })
    },
    [addDescriptionMutation, handleError],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingExpense) return
    deleteMutation.mutate(deletingExpense.id, {
      onSuccess: () => {
        setDeletingExpense(null)
        toast.success('Gasto eliminado')
      },
      onError: handleError,
    })
  }, [deletingExpense, deleteMutation, handleError])

  return {
    whoPaid,
    editingExpense,
    deletingExpense,
    formKey,
    isDeletePending,
    isPending,
    mutationError,
    handleSubmit,
    handleAddDescription,
    handleDeleteConfirm,
    setEditingExpense,
    setDeletingExpense,
  }
}
