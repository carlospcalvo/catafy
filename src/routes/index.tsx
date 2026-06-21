import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { GoogleSignInButton } from '#/components/google-sign-in-button'
import { ExpenseForm } from '#/components/expense-form'
import { ExpenseList } from '#/components/expense-list'
import { DeleteConfirmDialog } from '#/components/delete-confirm-dialog'
import { useLists } from '#/queries/use-lists'
import { useRecentExpenses } from '#/queries/use-recent-expenses'
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '#/queries/use-expense-mutations'
import { useAddDescription } from '#/queries/use-description-mutation'
import { detectWhoPaid } from '#/lib/jwt'
import { getStoredToken, clearStoredToken } from '#/lib/storage'
import type { Expense, ExpenseFormData } from '#/types/expense'
import { toast } from 'sonner'
import { LogOut, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [defaultWhoPaid, setDefaultWhoPaid] = useState<string>(() => {
    const stored = getStoredToken()
    return stored ? detectWhoPaid(stored) : ''
  })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [formKey, setFormKey] = useState(0)

  const { data: lists } = useLists(token)
  const { data: recent, isLoading: loadingExpenses, isFetching, refetch: refetchExpenses } = useRecentExpenses(token)

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

  const handleToken = useCallback((credential: string) => {
    setToken(credential)
    setDefaultWhoPaid(detectWhoPaid(credential))
  }, [])

  const handleSignOut = () => {
    try { google.accounts.id.disableAutoSelect() } catch {}
    clearStoredToken()
    setToken(null)
  }

  const handleSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, data },
        {
          onSuccess: () => {
            setEditingExpense(null)
            toast.success('Gasto actualizado')
          },
          onError: (err) => toast.error(err.message),
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setFormKey((k) => k + 1)
          toast.success('Gasto agregado')
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const handleAddDescription = useCallback((description: string) => {
    addDescriptionMutation.mutate(description, {
      onSuccess: () => toast.success('Descripción creada'),
      onError: (err) => toast.error(err.message),
    })
  }, [addDescriptionMutation])

  const handleDeleteConfirm = () => {
    if (!deletingExpense) return
    deleteMutation.mutate(deletingExpense.id, {
      onSuccess: () => {
        setDeletingExpense(null)
        toast.success('Gasto eliminado')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const expenses = recent?.expenses ?? []

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-6 flex flex-col items-center gap-2">
          <img src="/catafy-logo.png" alt="Catafy" className="h-20 w-20" />
          <h1
            className="text-2xl font-semibold display-title"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Catafy
          </h1>
          <p className="text-sm text-muted-foreground">
            Control de gastos para Cata y Carli
          </p>
        </div>
        <GoogleSignInButton onToken={handleToken} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-semibold display-title"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Catafy
          </h1>
          <p className="text-xs text-muted-foreground">Control de gastos</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {editingExpense ? 'Editar gasto' : 'Nuevo gasto'}
        </h2>
        {mutationError && (
          <p className="mb-3 text-xs text-destructive">{mutationError}</p>
        )}
        <ExpenseForm
          key={editingExpense?.id ?? formKey}
          editingExpense={editingExpense}
          defaultWhoPaid={defaultWhoPaid}
          descriptions={lists?.descriptions ?? []}
          categories={lists?.categories ?? []}
          paymentMethods={lists?.paymentMethods ?? []}
          onSubmit={handleSubmit}
          onCancel={() => setEditingExpense(null)}
          isPending={isPending}
          onAddDescription={handleAddDescription}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Gastos recientes
          </h2>
          <button
            type="button"
            onClick={() => refetchExpenses()}
            className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground active:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        <ExpenseList
          expenses={expenses}
          isLoading={loadingExpenses}
          onEdit={setEditingExpense}
          onDelete={setDeletingExpense}
        />
      </div>

      <DeleteConfirmDialog
        open={!!deletingExpense}
        onOpenChange={(open) => {
          if (!open) setDeletingExpense(null)
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
