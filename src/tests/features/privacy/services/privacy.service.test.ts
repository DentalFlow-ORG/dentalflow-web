import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({
  apiRequest: vi.fn(),
}))

import { createPrivacyRequest, logCookieConsent } from '@/features/privacy/services/privacy.service'

const mockApiRequest = vi.mocked(apiRequest)

// NOTE: deliberately no `beforeEach(() => mockApiRequest.mockReset()/mockClear())`
// here. Every test below sets its own mock implementation before use, so a reset
// isn't needed for correctness — and pairing mockReset()/mockClear() in a
// beforeEach with a mock whose implementation throws/rejects makes Vitest
// misattribute the (production-code-caught) rejection as an unhandled one,
// failing the test even though `logCookieConsent`'s own try/catch handles it.

describe('createPrivacyRequest', () => {
  it('POSTs the payload to /privacy/requests and returns the response', async () => {
    mockApiRequest.mockResolvedValue({ requestCode: 'REQ-1', message: 'ok' })
    const payload = {
      requesterName: 'Ana',
      requesterEmail: 'ana@clinica.com',
      requesterType: 'PATIENT' as const,
      requestType: 'ACCESS_DATA' as const,
      description: 'Quero acessar meus dados.',
      identityConfirmationAccepted: true,
    }
    const result = await createPrivacyRequest(payload)
    expect(mockApiRequest).toHaveBeenCalledWith('/privacy/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    expect(result).toEqual({ requestCode: 'REQ-1', message: 'ok' })
  })
})

describe('logCookieConsent', () => {
  const payload = {
    categories: { necessary: true as const, preferences: false, analytics: true, marketing: false },
    policyVersion: '1.0',
    source: 'banner' as const,
  }

  it('POSTs the payload to /privacy/cookie-consent', async () => {
    mockApiRequest.mockResolvedValue(undefined)
    await logCookieConsent(payload)
    expect(mockApiRequest).toHaveBeenCalledWith('/privacy/cookie-consent', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('silently swallows a request failure', async () => {
    mockApiRequest.mockImplementation(async () => {
      throw new Error('network error')
    })
    await expect(logCookieConsent(payload)).resolves.toBeUndefined()
  })
})
