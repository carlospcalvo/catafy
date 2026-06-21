import { forwardRef } from 'react'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { cn } from '#/lib/utils'
import { Circle } from 'lucide-react'

type RadioGroupProps = BaseRadioGroup.Props<string>

const RadioGroup = forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(({ className, ...props }, ref) => {
  return (
    <BaseRadioGroup
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof Radio.Root>
>(({ className, ...props }, ref) => {
  return (
    <Radio.Root
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 cursor-pointer rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Radio.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-primary" />
      </Radio.Indicator>
    </Radio.Root>
  )
})
RadioGroupItem.displayName = 'RadioGroupItem'

const RadioGroupCard = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof Radio.Root> & { children: React.ReactNode }
>(({ className, children, value, ...props }, ref) => {
  return (
    <Radio.Root
      ref={ref}
      value={value}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-unchecked:border-input data-checked:border-primary data-checked:bg-primary/5 data-checked:shadow-md',
        className,
      )}
      {...props}
    >
      <div className="flex aspect-square h-4 w-4 shrink-0 items-center justify-center rounded-full border data-checked:border-primary data-unchecked:border-input">
        <Radio.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </Radio.Indicator>
      </div>
      <span className="group-data-checked:text-primary">{children}</span>
    </Radio.Root>
  )
})
RadioGroupCard.displayName = 'RadioGroupCard'

export { RadioGroup, RadioGroupItem, RadioGroupCard }
