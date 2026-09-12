import type { PlaceholderCheck } from '@/config/company'
import { companyStatus, validateCompanyConfig } from '@/config/company'

describe('validateCompanyConfig', () => {
  const originalStatus = { ...companyStatus }

  afterEach(() => {
    Object.assign(companyStatus, originalStatus)
    vi.restoreAllMocks()
  })

  it('logs pending pre-launch fields when some companyStatus flags are false', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    validateCompanyConfig()

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy.mock.calls[0][0]).toContain('PRÉ-LANÇAMENTO')
  })

  it('does not log the pre-launch notice once all companyStatus flags are true', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    Object.assign(companyStatus, {
      hasRealDocumentNumber: true,
      hasRealAddress: true,
      hasNamedDpo: true,
      hasRealPhone: true,
    })

    validateCompanyConfig()

    expect(infoSpy).not.toHaveBeenCalled()
  })
})

// ── Placeholder guard ─────────────────────────────────────────────────────────
//
// The production registry is intentionally empty today, so these cases inject
// their own checks to exercise the guard that protects real builds.

describe('validateCompanyConfig — placeholder guard', () => {
  const FAILING_CHECK: PlaceholderCheck[] = [
    { field: 'supportEmail', isPlaceholder: () => true, hint: 'defina o e-mail real' },
  ]
  const PASSING_CHECK: PlaceholderCheck[] = [
    { field: 'supportEmail', isPlaceholder: () => false, hint: 'defina o e-mail real' },
  ]

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('warns in development listing every detected placeholder field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    validateCompanyConfig(FAILING_CHECK)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('1 placeholder(s) de produção detectado(s)')
    expect(warnSpy.mock.calls[0][0]).toContain('supportEmail: defina o e-mail real')
  })

  it('throws in a production build instead of only warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubEnv('PROD', true)

    expect(() => validateCompanyConfig(FAILING_CHECK)).toThrow(
      /1 placeholder\(s\) de produção detectado\(s\)/,
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('stays silent when no check reports a placeholder', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    validateCompanyConfig(PASSING_CHECK)

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
