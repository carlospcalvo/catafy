import { forwardRef } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from '#/lib/utils'

const Popover = BasePopover.Root

const PopoverTrigger = BasePopover.Trigger

const PopoverContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Popup> & {
    align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>['align']
    sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>['sideOffset']
  }
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <BasePopover.Portal>
    <BasePopover.Positioner
      align={align}
      sideOffset={sideOffset}
      className="data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
    >
      <BasePopover.Popup
        ref={ref}
        className={cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
          className,
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
))
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
