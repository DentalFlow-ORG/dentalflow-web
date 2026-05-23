import { createContext, useContext } from 'react'

import type { CookieConsentContextValue } from '../types/cookie-consent.types'

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
