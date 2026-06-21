import { useState, useCallback, useEffect } from 'react'
import { detectWhoPaid, isTokenExpired } from '#/lib/jwt'
import { getStoredToken, clearStoredToken } from '#/lib/storage'
import { toast } from 'sonner'

export function useAuth() {
  const [{ token, whoPaid }, setAuthState] = useState(() => {
    const stored = getStoredToken()
    if (stored && isTokenExpired(stored)) {
      clearStoredToken()
      return { token: null as string | null, whoPaid: '' }
    }
    return { token: stored, whoPaid: stored ? detectWhoPaid(stored) : '' }
  })

  const handleSessionExpired = useCallback(() => {
    clearStoredToken()
    setAuthState({ token: null, whoPaid: '' })
    toast.error('Sesión expirada')
  }, [])

  useEffect(() => {
    const check = () => {
      const stored = getStoredToken()
      if (stored && isTokenExpired(stored)) {
        handleSessionExpired()
      }
    }
    check()
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [handleSessionExpired])

  const handleToken = useCallback((credential: string) => {
    setAuthState({ token: credential, whoPaid: detectWhoPaid(credential) })
  }, [])

  const signOut = useCallback(() => {
    try { google.accounts.id.disableAutoSelect() } catch {}
    clearStoredToken()
    setAuthState({ token: null, whoPaid: '' })
  }, [])

  return { token, whoPaid, handleToken, handleSessionExpired, signOut }
}
