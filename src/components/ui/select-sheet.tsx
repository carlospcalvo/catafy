import { useState } from 'react'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { cn } from '#/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

interface SelectSheetProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  title?: string
  options: { label: string; value: string }[]
  className?: string
}

export function SelectSheet({ value, onValueChange, placeholder, title, options, className }: SelectSheetProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const display = selected?.label ?? placeholder ?? 'Seleccionar…'

  return (
    <>
      {/* Native select for desktop */}
      <div className="relative hidden sm:block">
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            'flex h-9 w-full cursor-pointer appearance-none items-center rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm max-sm:text-base shadow-sm transition-colors',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Bottom sheet for mobile */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
              !selected && 'text-muted-foreground',
              className,
            )}
          >
            <span>{display}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          <SheetContent>
            {title && <SheetTitle className="mb-4 text-base font-semibold">{title}</SheetTitle>}
            <div className="-mx-2 space-y-0.5">
              {options.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">Sin opciones</p>
              )}
              {options.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onValueChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between rounded-lg border bg-background px-4 py-3 text-left text-sm shadow-sm transition-colors hover:bg-accent',
                      isSelected
                        ? 'border-primary font-medium text-primary'
                        : 'border-transparent',
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-5 w-5 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
