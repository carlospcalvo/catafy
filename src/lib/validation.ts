import { z } from 'zod'
import { format } from 'date-fns'
import type { ExpenseFormData } from '#/types/expense'

const todayStr = format(new Date(), 'yyyy-MM-dd')

export const expenseFormSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .refine((val) => val <= todayStr, 'La fecha no puede ser posterior a hoy'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  category: z.string().min(1, 'Seleccioná una categoría'),
  description: z.string().min(1, 'La descripción no puede estar vacía'),
  whoPaid: z.enum(['Cata', 'Carli'], { message: 'Seleccioná quién pagó' }),
  paymentMethod: z.string().min(1, 'Seleccioná un método de pago'),
  notes: z.string().optional().default(''),
  installments: z.number().int().positive().default(1),
})

export type ValidatedFormData = z.infer<typeof expenseFormSchema>

export function validateFormData(data: ExpenseFormData) {
  const result = expenseFormSchema.safeParse(data)
  if (result.success) return { ok: true as const, data: result.data }

  const errors: Partial<Record<keyof ExpenseFormData, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ExpenseFormData
    if (!errors[field]) errors[field] = issue.message
  }

  return { ok: false as const, errors }
}
