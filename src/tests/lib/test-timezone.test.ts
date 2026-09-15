/**
 * Guards the guard: billing and scheduling assertions are written against
 * America/Sao_Paulo, so they only prove anything when the runner is *not*
 * already in that zone. `vite.config.ts` pins the test process to UTC; if that
 * is ever removed, this fails instead of quietly weakening every
 * timezone-sensitive test in the suite.
 */
describe('test runner timezone', () => {
  it('runs in UTC, not the developer machine timezone', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('UTC')
  })

  it('treats an offset-less timestamp as UTC', () => {
    expect(new Date('2026-10-15T00:10:00').toISOString()).toBe('2026-10-15T00:10:00.000Z')
  })
})
