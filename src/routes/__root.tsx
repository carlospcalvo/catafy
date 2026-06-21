import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: RootDocument,
})

function RootDocument() {
  return (
    <>
      <Outlet />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ className: 'text-sm' }}
      />
    </>
  )
}
