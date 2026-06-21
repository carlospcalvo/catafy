import { useState, useDeferredValue, useMemo, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { cn } from '#/lib/utils'
import { Check, ChevronDown, Plus, Search } from 'lucide-react'

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: string[]
  placeholder?: string
  title?: string
  onCreate?: (value: string) => void
  className?: string
}

export function Combobox({ value, onValueChange, options, placeholder, title, onCreate, className }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!deferredSearch) return options
    const q = deferredSearch.toLowerCase()
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, deferredSearch])

  const showCreate = deferredSearch && !filtered.some((o) => o.toLowerCase() === deferredSearch.toLowerCase())

  const handleSelect = (val: string) => {
    onValueChange(val)
    setSearch('')
    setOpen(false)
    setMobileOpen(false)
  }

  const handleCreate = () => {
    if (onCreate && deferredSearch) {
      onCreate(deferredSearch)
      onValueChange(deferredSearch)
    }
    setSearch('')
    setOpen(false)
    setMobileOpen(false)
  }

  const display = value || placeholder || 'Seleccionar…'

  const optionList = (asSheet: boolean) => (
    <div className="flex flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="h-10 w-full border-b border-border bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
          autoFocus
        />
      </div>
      <div className={cn(
        'overflow-y-auto',
        asSheet ? 'max-h-[50vh]' : 'max-h-60',
      )}>
        {filtered.length === 0 && !showCreate && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados</p>
        )}
        {filtered.map((opt) => {
          const isSelected = opt === value
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                isSelected ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              <span>{opt}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          )
        })}
        {showCreate && (
          <button
            type="button"
            onClick={handleCreate}
            className="flex w-full cursor-pointer items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Crear «{deferredSearch}»</span>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden sm:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
              !value && 'text-muted-foreground',
              className,
            )}
          >
            <span className="truncate">{display}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) p-0" align="start" sideOffset={4}>
            {optionList(false)}
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{display}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent>
            {title && <SheetTitle className="mb-4 text-base font-semibold">{title}</SheetTitle>}
            {optionList(true)}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
