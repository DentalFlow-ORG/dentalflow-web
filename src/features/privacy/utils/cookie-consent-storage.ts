import { COOKIE_POLICY_VERSION as CONFIG_COOKIE_VERSION } from '@/config/company'
import type { CookieConsent } from '../types/cookie-consent.types'

export const COOKIE_CONSENT_KEY = 'dentalflow_cookie_consent_v1'
/** Fonte canônica: companyInfo.cookiePolicyVersion em src/config/company.ts */
export const COOKIE_POLICY_VERSION = CONFIG_COOKIE_VERSION

export function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieConsent
    if (parsed.version !== COOKIE_POLICY_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

export function buildConsent(
  prefs: { preferences: boolean; analytics: boolean; marketing: boolean },
  source: CookieConsent['source'],
): CookieConsent {
  return {
    version: COOKIE_POLICY_VERSION,
    timestamp: new Date().toISOString(),
    source,
    categories: {
      necessary: true,
      ...prefs,
    },
  }
}
