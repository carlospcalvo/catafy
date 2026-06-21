import type { ListsResponse, RecentExpensesResponse, MutationResponse, ExpenseFormData } from '#/types/expense'
import { isTokenExpired } from '#/lib/jwt'
import { clearStoredToken } from '#/lib/storage'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL ?? ''

function buildParams(fields: Record<string, string | number | null>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    params.set(key, String(value))
  }
  return params
}

function guardToken(idToken: string) {
  if (isTokenExpired(idToken)) {
    clearStoredToken()
    throw new Error('Sesión expirada')
  }
}

export async function fetchLists(idToken: string): Promise<ListsResponse> {
  guardToken(idToken)
  const body = new URLSearchParams({ token: idToken, action: 'lists' })
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Failed to fetch lists')
  return res.json()
}

export async function fetchRecentExpenses(idToken: string): Promise<RecentExpensesResponse> {
  guardToken(idToken)
  const body = new URLSearchParams({ token: idToken, action: 'recent' })
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Failed to fetch expenses')
  return res.json()
}

async function postAndCheck(body: URLSearchParams): Promise<MutationResponse> {
  // guardToken is called by the caller before this
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Error de conexión')
  const json: MutationResponse = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Error desconocido')
  return json
}

export async function createExpense(idToken: string, data: ExpenseFormData): Promise<MutationResponse> {
  guardToken(idToken)
  const params = buildParams({ action: 'create', ...data })
  params.set('token', idToken)
  return postAndCheck(params)
}

export async function updateExpense(idToken: string, id: string, data: ExpenseFormData): Promise<MutationResponse> {
  guardToken(idToken)
  const params = buildParams({ action: 'update', id, ...data })
  params.set('token', idToken)
  return postAndCheck(params)
}

export async function addDescription(idToken: string, description: string): Promise<MutationResponse> {
  guardToken(idToken)
  const body = new URLSearchParams({ token: idToken, action: 'add-description', description })
  return postAndCheck(body)
}

export async function deleteExpense(idToken: string, id: string): Promise<MutationResponse> {
  guardToken(idToken)
  const body = new URLSearchParams({ token: idToken, action: 'delete', id })
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Failed to delete expense')
  return res.json()
}
