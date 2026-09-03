import {
  COOKIE_CONSENT_KEY,
  COOKIE_POLICY_VERSION,
  buildConsent,
  loadConsent,
  saveConsent,
} from '@/features/privacy/utils/cookie-consent-storage'

describe('loadConsent', () => {
  beforeEach(() => localStorage.clear())

  it('returns null when nothing is stored', () => {
    expect(loadConsent()).toBeNull()
  })

  it('returns the parsed consent when a valid current-version value is stored', () => {
    const stored = {
      version: COOKIE_POLICY_VERSION,
      timestamp: '2026-01-01T00:00:00.000Z',
      source: 'banner' as const,
      categories: { necessary: true, preferences: true, analytics: false, marketing: false },
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored))
    expect(loadConsent()).toEqual(stored)
  })

  it('returns null when the stored version does not match the current policy version', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        version: 'old-version',
        timestamp: '2026-01-01T00:00:00.000Z',
        source: 'banner',
        categories: { necessary: true, preferences: false, analytics: false, marketing: false },
      }),
    )
    expect(loadConsent()).toBeNull()
  })

  it('returns null when the stored value is malformed JSON', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, '{not valid json')
    expect(loadConsent()).toBeNull()
  })

  it('returns null when localStorage.getItem throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    expect(loadConsent()).toBeNull()
    Storage.prototype.getItem = original
  })
})

describe('saveConsent', () => {
  beforeEach(() => localStorage.clear())

  it('persists the consent as JSON', () => {
    const consent = buildConsent(
      { preferences: true, analytics: false, marketing: false },
      'banner',
    )
    saveConsent(consent)
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)).toEqual(consent)
  })

  it('does not throw when localStorage.setItem throws', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
    expect(() =>
      saveConsent(
        buildConsent({ preferences: false, analytics: false, marketing: false }, 'banner'),
      ),
    ).not.toThrow()
    Storage.prototype.setItem = original
  })
})

describe('buildConsent', () => {
  it('builds a consent object with the necessary category always true', () => {
    const consent = buildConsent(
      { preferences: true, analytics: true, marketing: false },
      'preferences',
    )
    expect(consent.version).toBe(COOKIE_POLICY_VERSION)
    expect(consent.source).toBe('preferences')
    expect(consent.categories).toEqual({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: false,
    })
    expect(typeof consent.timestamp).toBe('string')
  })
})
