import { useEffect, useRef } from 'react'
import { setStoredToken } from '#/lib/storage'

interface GoogleSignInButtonProps {
  onToken: (token: string) => void
}

export function GoogleSignInButton({ onToken }: GoogleSignInButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        callback: (response) => {
          if (response.credential) {
            setStoredToken(response.credential)
            onToken(response.credential)
          }
        },
      } satisfies google.accounts.id.IdConfiguration)
      google.accounts.id.renderButton(btnRef.current!, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
      } satisfies google.accounts.id.GsiButtonConfiguration)
      google.accounts.id.prompt()
    }
  }, [onToken])

  return <div ref={btnRef} />
}
