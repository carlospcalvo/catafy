import { useState, useCallback, useEffect } from 'react'
import { isTokenExpired } from '#/lib/jwt'
import { getStoredToken, clearStoredToken } from '#/lib/storage'
import { toast } from 'sonner'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    const stored = getStoredToken()
    if (stored && isTokenExpired(stored)) {
      clearStoredToken()
      return null
    }
    return stored
  })

  const handleSessionExpired = useCallback(() => {
    clearStoredToken()
    setToken(null)
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
    setToken(credential)
  }, [])

  const signOut = useCallback(() => {
    try { google.accounts.id.disableAutoSelect() } catch {}
    clearStoredToken()
    setToken(null)
  }, [])

  return { token, handleToken, handleSessionExpired, signOut }
}
