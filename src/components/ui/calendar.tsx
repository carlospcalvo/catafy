import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { cn } from '#/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, locale, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale ?? es}
      className={cn('p-3', className)}
      classNames={{
        root: cn('rdp-root', className),
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        button_previous: 'absolute left-1 h-7 w-7 cursor-pointer bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input',
        button_next: 'absolute right-1 h-7 w-7 cursor-pointer bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input',
        month_grid: 'w-full grid grid-cols-7 gap-0',
        weekdays: 'contents',
        weekday: 'text-muted-foreground rounded-md font-normal text-[0.8rem] flex items-center justify-center h-8',
        weeks: 'contents',
        week: 'contents',
        day: cn(
          'flex items-center justify-center p-0 text-sm focus-within:relative focus-within:z-20',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day_button: 'h-8 w-8 cursor-pointer p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          const Icon = props.orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className={cn('h-4 w-4', props.className)} />
        },
        MonthGrid: (props) => <div {...props} role="grid" />,
        Weekdays: (props) => <div {...props} role="rowgroup" />,
        Weekday: (props) => <div {...props} role="columnheader" />,
        Weeks: (props) => <div {...props} role="rowgroup" />,
        Week: (props) => {
          const { week, ...divProps } = props
          return <div {...divProps} role="row" />
        },
        Day: (props) => <div {...props} role="gridcell" />,
      }}
      {...props}
    />
  )
}

export { Calendar }
