import vercelConfigRaw from '../../../vercel.json?raw'

import { assertApiOriginAllowedByCsp, connectSrcOrigins } from '../../../config/csp-api-origin'

/**
 * VITE_API_URL is set in the hosting provider and connect-src lives in
 * vercel.json, independently of each other. If the API moves and the policy
 * does not follow, the browser blocks every request and the app looks dead with
 * nothing in the UI to explain it. The build asserts the two agree; these cover
 * the rule it applies.
 */

const productionCsp = (() => {
  const config = JSON.parse(vercelConfigRaw) as {
    headers?: { headers?: { key: string; value: string }[] }[]
  }
  const csp = config.headers
    ?.flatMap((entry) => entry.headers ?? [])
    .find((header) => header.key === 'Content-Security-Policy')?.value
  if (!csp) throw new Error('vercel.json has no Content-Security-Policy header')
  return csp
})()

describe('connectSrcOrigins', () => {
  it('reads the origins the policy actually permits', () => {
    expect(connectSrcOrigins(productionCsp)).toContain("'self'")
  })

  it('returns nothing when the policy has no connect-src', () => {
    expect(connectSrcOrigins("default-src 'self'; script-src 'self'")).toEqual([])
  })

  it('does not confuse another directive for connect-src', () => {
    expect(connectSrcOrigins("default-src 'self' https://a.example")).toEqual([])
  })
})

describe('assertApiOriginAllowedByCsp', () => {
  it('accepts the production API origin the policy was written for', () => {
    const allowed = connectSrcOrigins(productionCsp).filter((o) => o.startsWith('https://'))
    expect(allowed.length).toBeGreaterThan(0)

    for (const origin of allowed) {
      expect(() => assertApiOriginAllowedByCsp(`${origin}/api`, productionCsp)).not.toThrow()
    }
  })

  it('rejects an API origin the policy would block', () => {
    expect(() =>
      assertApiOriginAllowedByCsp('https://api.somewhere-else.example/api', productionCsp),
    ).toThrow(/does not allow/)
  })

  it('names the offending origin and the permitted ones', () => {
    expect(() =>
      assertApiOriginAllowedByCsp('https://api.somewhere-else.example/api', productionCsp),
    ).toThrow(/https:\/\/api\.somewhere-else\.example/)
  })

  it.each(['http://localhost:3000/api', 'http://127.0.0.1:3000/api'])(
    'exempts the local origin %s, which never runs behind these headers',
    (url) => {
      expect(() => assertApiOriginAllowedByCsp(url, productionCsp)).not.toThrow()
    },
  )

  it('rejects a value that is not a URL at all', () => {
    expect(() => assertApiOriginAllowedByCsp('not-a-url', productionCsp)).toThrow(/not a valid URL/)
  })
})
