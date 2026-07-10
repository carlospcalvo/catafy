import { Drawer } from 'vaul'
import { cn } from '#/lib/utils'

export function Sheet({ children, ...props }: React.ComponentProps<typeof Drawer.Root>) {
  return (
    <Drawer.Root modal={false} repositionInputs={false} {...props}>
      {children}
    </Drawer.Root>
  )
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Drawer.Portal>
      <div className="fixed inset-0 z-50 bg-black/50 shadow-[inset_0_8px_32px_rgba(0,0,0,0.25)]" />
      <Drawer.Content
        id="DrawerContent"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 max-h-[96%] rounded-t-xl border bg-background p-6',
          className,
        )}
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
