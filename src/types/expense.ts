export interface Expense {
  id: string
  date: string
  amount: number
  category: string
  description: string
  whoPaid: string
  paymentMethod: string
  notes: string
  installments: number
}

export interface ListsResponse {
  descriptions: string[]
  categories: string[]
  paymentMethods: string[]
}

export interface RecentExpensesResponse {
  expenses: Expense[]
}

export interface MutationResponse {
  success: boolean
  error?: string
}

export interface ExpenseFormData {
  date: string
  amount: number | null
  category: string
  description: string
  whoPaid: string
  paymentMethod: string
  notes: string
  installments: number
}
