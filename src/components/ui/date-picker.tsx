import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button, buttonVariants } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dateStr = value ? value.split('T')[0] : undefined
  const date = dateStr ? new Date(dateStr + 'T00:00:00') : undefined

  const selectMobileDate = (d: Date | undefined) => {
    if (d) {
      onChange(format(d, 'yyyy-MM-dd'))
      setMobileOpen(false)
    }
  }

  return (
    <>
      {/* Desktop popover — uncontrolled, no shared state */}
      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {date ? (
              format(date, 'PPP', { locale: es })
            ) : (
              <span>Seleccionar fecha</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) onChange(format(d, 'yyyy-MM-dd'))
              }}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile bottom sheet — isolated state */}
      <div className="sm:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? (
            format(date, 'PPP', { locale: es })
          ) : (
            <span>Seleccionar fecha</span>
          )}
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent>
            <SheetTitle className="sr-only">Seleccionar fecha</SheetTitle>
            <Calendar
              mode="single"
              selected={date}
              onSelect={selectMobileDate}
              disabled={{ after: new Date() }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
