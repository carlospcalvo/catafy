import { Drawer } from 'vaul'
import { cn } from '#/lib/utils'
import { useVisualViewport } from '#/lib/use-visual-viewport'

export function Sheet({ children, ...props }: React.ComponentProps<typeof Drawer.Root>) {
  return (
    <Drawer.Root {...props}>
      {children}
    </Drawer.Root>
  )
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { keyboardHeight, isKeyboardOpen } = useVisualViewport()

  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 cursor-pointer bg-black/50" />
      <Drawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 max-h-[96%] rounded-t-xl border bg-background p-6 shadow-lg transition-transform duration-200',
          className,
        )}
        style={{
          transform: isKeyboardOpen ? `translateY(-${keyboardHeight}px)` : undefined,
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  )
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>{children}</h2>
}
