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
        locale: 'es-419',
        callback: (response) => {
          if (response.credential) {
            setStoredToken(response.credential)
            onToken(response.credential)
          }
        },
      })
      google.accounts.id.renderButton(btnRef.current!, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
      })
      google.accounts.id.prompt()
    }
  }, [onToken])

  return <div ref={btnRef} />
}
