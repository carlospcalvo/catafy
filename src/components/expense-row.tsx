import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useSwipeAction } from '#/lib/use-swipe-action'
import type { Expense } from '#/types/expense'

interface ExpenseRowProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDeleteRequest: (expense: Expense) => void
}

function categoryHue(category: string): number {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return hash % 360
}

const amountFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatAmount(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return amountFormatter.format(0)
  return amountFormatter.format(amount)
}

function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: es })
  } catch {
    return dateStr
  }
}

const reducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const SWIPE_THRESHOLD = 80

export function ExpenseRow({ expense, onEdit, onDeleteRequest }: ExpenseRowProps) {
  const hue = categoryHue(expense.category)
  const formattedAmount = formatAmount(expense.amount)
  const shortDate = formatShortDate(expense.date)

  const { dragX, isDragging, handlers } = useSwipeAction({
    onEdit: () => onEdit(expense),
    onDelete: () => onDeleteRequest(expense),
  })

  const showYellow = dragX > 0
  const showRed = dragX < 0
  const dragProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)

  const transitionStyle = isDragging
    ? undefined
    : reducedMotion
      ? 'transform 0ms'
      : 'transform 180ms ease-out'

  return (
    <div className="relative overflow-hidden" style={{ touchAction: 'pan-y' }}>
      {/* Swipe backgrounds */}
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center w-[120px] pointer-events-none transition-opacity duration-150"
        style={{ opacity: showYellow ? 0.15 + dragProgress * 0.15 : 0 }}
      >
        <div className="size-full bg-yellow-400" />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center w-[120px] pointer-events-none transition-opacity duration-150"
        style={{ opacity: showRed ? 0.15 + dragProgress * 0.15 : 0 }}
      >
        <div className="size-full bg-red-500" />
      </div>

      {/* Swipe icons */}
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center w-[120px] pointer-events-none"
        style={{ opacity: showYellow ? dragProgress : 0 }}
      >
        <Pencil className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center w-[120px] pointer-events-none"
        style={{ opacity: showRed ? dragProgress : 0 }}
      >
        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>

      {/* Foreground row */}
      <div
        className="relative bg-background"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: transitionStyle,
        }}
        onPointerDown={handlers.onPointerDown}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Left: description, badge, metadata */}
          <div className="flex-1 min-w-0 space-y-0.5">
            {/* Line 1: description + category badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-medium leading-tight">
                {expense.description}
              </span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none bg-[hsl(var(--cat-hue),65%,90%)] text-[hsl(var(--cat-hue),55%,30%)] dark:bg-[hsl(var(--cat-hue),35%,22%)] dark:text-[hsl(var(--cat-hue),60%,80%)]"
                style={{ '--cat-hue': hue } as React.CSSProperties}
              >
                {expense.category}
              </span>
            </div>

            {/* Line 2: whoPaid · paymentMethod · installments (if > 1) */}
            <div className="text-[13px] text-muted-foreground">
              <span>{expense.whoPaid}</span>
              <span className="mx-1">·</span>
              <span>{expense.paymentMethod}</span>
              {expense.installments && expense.installments > 1 && (
                <>
                  <span className="mx-1">·</span>
                  <span>{expense.installments} cuotas</span>
                </>
              )}
            </div>

            {/* Line 3: notes (only if non-empty) */}
            {expense.notes && (
              <div className="text-[12px] italic text-muted-foreground/70">
                {expense.notes}
              </div>
            )}
          </div>

          {/* Right: amount + date */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[16px] font-medium leading-tight">{formattedAmount}</span>
            <span className="text-[12px] text-muted-foreground/60 leading-tight">{shortDate}</span>
          </div>

          {/* Far right: edit/delete buttons */}
          <div className="hidden md:flex flex-col items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/50 hover:text-foreground"
              onClick={() => onEdit(expense)}
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/50 hover:text-destructive"
              onClick={() => onDeleteRequest(expense)}
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
