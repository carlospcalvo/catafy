const EMAIL_MAP: Record<string, string> = {
  catagracia8: 'Cata',
  carloscalvonazabal: 'Carli',
}

const NAME_MAP: Record<string, string> = {
  cata: 'Cata',
  carli: 'Carli',
  carlos: 'Carli',
}

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload) return true
  const exp = payload.exp as number
  return Date.now() / 1000 >= exp
}

export function detectWhoPaid(token: string): string {
  const payload = decodeJwt(token)
  if (!payload) return ''

  const email = ((payload.email as string) ?? '').split('@')[0].toLowerCase()
  if (EMAIL_MAP[email]) return EMAIL_MAP[email]

  const name = ((payload.name as string) ?? '').toLowerCase()
  const givenName = ((payload.given_name as string) ?? '').toLowerCase()

  const candidates = [name, givenName].filter(Boolean)
  for (const candidate of candidates) {
    for (const [key, value] of Object.entries(NAME_MAP)) {
      if (candidate.includes(key)) return value
    }
  }

  return ''
}
