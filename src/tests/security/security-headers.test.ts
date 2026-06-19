// Raw import (typed via vite/client's `*?raw` module declaration) keeps this
// test free of Node globals so it builds under the browser tsconfig.
import vercelConfigRaw from '../../../vercel.json?raw'

type VercelHeader = { key: string; value: string }
type VercelConfig = {
  headers?: { source: string; headers: VercelHeader[] }[]
}

function loadHeaders(): Map<string, string> {
  const config = JSON.parse(vercelConfigRaw) as VercelConfig
  const rule = config.headers?.find((entry) => entry.source === '/(.*)')
  const map = new Map<string, string>()
  for (const header of rule?.headers ?? []) {
    map.set(header.key.toLowerCase(), header.value)
  }
  return map
}

describe('vercel.json security headers', () => {
  const headers = loadHeaders()

  it('applies a Content-Security-Policy to every route', () => {
    expect(headers.has('content-security-policy')).toBe(true)
  })

  it('locks down framing and base-uri in the CSP', () => {
    const csp = headers.get('content-security-policy') ?? ''
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  it('allows the SPA to reach the API origin but nothing else by default', () => {
    const csp = headers.get('content-security-policy') ?? ''
    expect(csp).toMatch(/connect-src 'self' https:\/\/dentalflow-api\.onrender\.com/)
  })

  it('sets the supporting hardening headers', () => {
    expect(headers.get('x-content-type-options')).toBe('nosniff')
    expect(headers.get('x-frame-options')).toBe('DENY')
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    expect(headers.get('strict-transport-security')).toContain('max-age=')
    expect(headers.has('permissions-policy')).toBe(true)
  })

  it('keeps microphone enabled for clinical dictation while denying camera', () => {
    const permissions = headers.get('permissions-policy') ?? ''
    expect(permissions).toContain('microphone=(self)')
    expect(permissions).toContain('camera=()')
  })
})
