import { useState, useEffect, useMemo } from 'react'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Combobox } from '#/components/ui/combobox'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
} from '#/components/ui/number-field'
import { SelectSheet } from '#/components/ui/select-sheet'
import { RadioGroup, RadioGroupCard } from '#/components/ui/radio-group'
import { DatePicker } from '#/components/ui/date-picker'
import { validateFormData } from '#/lib/validation'
import type { Expense, ExpenseFormData } from '#/types/expense'
import { cn } from '#/lib/utils'
import { Loader2 } from 'lucide-react'

export const WHO_PAID_OPTIONS = ['Cata', 'Carli']
const CARD_KEYWORDS = ['VISA', 'MASTERCARD', 'AMEX']
const INSTALLMENT_OPTIONS = [1, 3, 6, 12, 18]

function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const EMPTY_FORM: ExpenseFormData = {
  date: todayLocal(),
  amount: null,
  category: '',
  description: '',
  whoPaid: '',
  paymentMethod: '',
  notes: '',
  installments: 1,
}

interface ExpenseFormProps {
  editingExpense?: Expense | null
  defaultWhoPaid?: string
  descriptions: string[]
  categories: string[]
  paymentMethods: string[]
  onSubmit: (data: ExpenseFormData) => void
  onCancel: () => void
  isPending: boolean
  onAddDescription?: (value: string) => void
}

export function ExpenseForm({
  editingExpense,
  defaultWhoPaid,
  descriptions,
  categories,
  paymentMethods,
  onSubmit,
  onCancel,
  isPending,
  onAddDescription,
}: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>({
    ...EMPTY_FORM,
    whoPaid: defaultWhoPaid ?? '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseFormData, string>>
  >({})

  useEffect(() => {
    if (editingExpense) {
      setForm({
        date: editingExpense.date.split('T')[0],
        amount: editingExpense.amount,
        category: editingExpense.category,
        description: editingExpense.description,
        whoPaid: editingExpense.whoPaid,
        paymentMethod: editingExpense.paymentMethod,
        notes: editingExpense.notes,
        installments: editingExpense.installments,
      })
      setErrors({})
    } else {
      setForm({ ...EMPTY_FORM, whoPaid: defaultWhoPaid ?? '' })
      setErrors({})
    }
  }, [editingExpense, defaultWhoPaid])

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    const result = validateFormData({
      ...form,
      amount: form.amount ?? 0,
      date: form.date.split('T')[0],
    })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    onSubmit(result.data)
  }

  const setWithClear =
    (field: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  const setFieldWithClear =
    (field: keyof ExpenseFormData) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const setWhoPaid = (value: string) => {
    setForm((prev) => ({ ...prev, whoPaid: value }))
    setErrors((prev) => ({ ...prev, whoPaid: undefined }))
  }

  const setDate = (date: string) => {
    setForm((prev) => ({ ...prev, date }))
    setErrors((prev) => ({ ...prev, date: undefined }))
  }

  const isEditing = !!editingExpense
  const isCard = useMemo(
    () =>
      CARD_KEYWORDS.some((kw) => form.paymentMethod.toUpperCase().includes(kw)),
    [form.paymentMethod],
  )

  useEffect(() => {
    if (!isCard) {
      setForm((prev) => ({ ...prev, installments: 1 }))
    }
  }, [isCard])

  const setInstallments = (value: number) => {
    setForm((prev) => ({ ...prev, installments: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha</Label>
          <DatePicker value={form.date} onChange={setDate} />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Monto</Label>
          <NumberField
            size="lg"
            value={form.amount}
            onValueChange={(_val) => {
              setForm((prev) => ({ ...prev, amount: _val }))
              setErrors((prev) => ({ ...prev, amount: undefined }))
            }}
            min={0}
            step={1}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          >
            <NumberFieldGroup>
              <NumberFieldInput style={{ fontSize: 16 }} placeholder="1000" />
            </NumberFieldGroup>
          </NumberField>
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <SelectSheet
            value={form.category}
            onValueChange={setFieldWithClear('category')}
            placeholder="Seleccionar…"
            title="Seleccioná una categoría"
            options={categories.map((c) => ({ label: c, value: c }))}
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Método de pago</Label>
          <SelectSheet
            value={form.paymentMethod}
            onValueChange={setFieldWithClear('paymentMethod')}
            placeholder="Seleccionar…"
            title="Seleccioná un método de pago"
            options={paymentMethods.map((pm) => ({ label: pm, value: pm }))}
          />
          {errors.paymentMethod && (
            <p className="text-xs text-destructive">{errors.paymentMethod}</p>
          )}
          {isCard && (
            <div className="mt-3 space-y-2">
              <Label>Cuotas</Label>
              <div className="flex flex-wrap gap-2">
                {INSTALLMENT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallments(n)}
                    className={cn(
                      'flex h-9 min-w-12 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
                      form.installments === n
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-input bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.installments === 1
                  ? 'Pago único'
                  : `${form.installments} cuotas`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Combobox
          value={form.description}
          onValueChange={setFieldWithClear('description')}
          options={descriptions}
          placeholder="Seleccionar…"
          title="Seleccioná una descripción"
          onCreate={onAddDescription}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Quién pagó</Label>
        <RadioGroup
          value={form.whoPaid}
          onValueChange={setWhoPaid}
          className="grid grid-cols-2"
        >
          {WHO_PAID_OPTIONS.map((name) => (
            <RadioGroupCard key={name} value={name}>
              {name}
            </RadioGroupCard>
          ))}
        </RadioGroup>
        {errors.whoPaid && (
          <p className="text-xs text-destructive">{errors.whoPaid}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-sm:text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          autoComplete="off"
          value={form.notes}
          onChange={setWithClear('notes')}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? 'Guardando…' : (isEditing ? 'Actualizar' : 'Agregar gasto')}
        </Button>
      </div>
    </form>
  )
}
