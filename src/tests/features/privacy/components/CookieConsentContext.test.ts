import { useCookieConsent } from '@/features/privacy/components/CookieConsentContext'
import { renderHook } from '@/test-utils/render-utils'

describe('useCookieConsent', () => {
  it('throws when used outside CookieConsentProvider', () => {
    expect(() => renderHook(() => useCookieConsent())).toThrow(
      'useCookieConsent must be used within CookieConsentProvider',
    )
  })
})
