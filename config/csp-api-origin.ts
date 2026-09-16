/**
 * Keeps the deployed API origin and the Content-Security-Policy in step.
 *
 * `VITE_API_URL` is configured in the hosting provider while `connect-src`
 * lives in `vercel.json`. They are set independently, and if the API moves
 * without the policy following, the browser blocks every request with no
 * application-level error — the app simply appears dead. Checking at build
 * time turns that into a failed deploy instead.
 */

/** Extracts the origins allowed by the `connect-src` directive of a CSP. */
export function connectSrcOrigins(csp: string): string[] {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect-src'))

  if (!directive) return []

  return directive.split(/\s+/).slice(1)
}

/**
 * Throws unless `apiUrl`'s origin is reachable under the policy.
 *
 * Local origins are exempt: a developer preview build never runs behind the
 * production headers.
 */
export function assertApiOriginAllowedByCsp(apiUrl: string, csp: string): void {
  let origin: string
  try {
    origin = new URL(apiUrl).origin
  } catch {
    throw new Error(`VITE_API_URL is not a valid URL: "${apiUrl}"`)
  }

  const host = new URL(apiUrl).hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return

  const allowed = connectSrcOrigins(csp)
  if (allowed.includes(origin)) return

  const permitted = allowed.join(' ') || '(nothing)'
  throw new Error(
    `VITE_API_URL points at ${origin}, which the Content-Security-Policy in vercel.json does not allow. connect-src currently permits: ${permitted}. The browser would block every API request. Add the origin to connect-src, or correct VITE_API_URL.`,
  )
}
