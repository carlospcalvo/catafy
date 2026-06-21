import { ExpenseRow } from '#/components/expense-row'
import type { Expense } from '#/types/expense'
import { ReceiptText, Loader2 } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  isLoading: boolean
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function ExpenseList({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ReceiptText className="h-10 w-10 mb-2" />
        <p className="text-sm">Todavía no hay gastos</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y divide-border overflow-hidden">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDeleteRequest={onDelete}
        />
      ))}
    </div>
  )
}
