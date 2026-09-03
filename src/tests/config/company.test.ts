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
