import { type ReactNode, useCallback, useMemo, useState } from 'react'

import { logCookieConsent } from '../services/privacy.service'
import type { CookieConsent } from '../types/cookie-consent.types'
import {
  COOKIE_POLICY_VERSION,
  buildConsent,
  loadConsent,
  saveConsent,
} from '../utils/cookie-consent-storage'

import { CookieBanner } from './CookieBanner'
import { CookieConsentContext } from './CookieConsentContext'
import { CookiePreferencesModal } from './CookiePreferencesModal'

type Props = { children: ReactNode }

export function CookieConsentProvider({ children }: Props) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => loadConsent())
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  const persist = useCallback((c: CookieConsent) => {
    saveConsent(c)
    setConsent(c)
    // Best-effort backend log — never blocks user interaction
    logCookieConsent({
      categories: c.categories,
      policyVersion: COOKIE_POLICY_VERSION,
      source: c.source,
    })
  }, [])

  const acceptAll = useCallback(() => {
    persist(buildConsent({ preferences: true, analytics: true, marketing: true }, 'banner'))
  }, [persist])

  const rejectOptional = useCallback(() => {
    persist(buildConsent({ preferences: false, analytics: false, marketing: false }, 'banner'))
  }, [persist])

  const savePreferences = useCallback(
    (prefs: { preferences: boolean; analytics: boolean; marketing: boolean }) => {
      persist(buildConsent(prefs, 'preferences'))
      setIsPreferencesOpen(false)
    },
    [persist],
  )

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), [])
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

  const hasConsented = consent !== null
  const isBannerVisible = !hasConsented

  const contextValue = useMemo(
    () => ({
      consent,
      hasConsented,
      isBannerVisible,
      isPreferencesOpen,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      consent,
      hasConsented,
      isBannerVisible,
      isPreferencesOpen,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  )

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {isBannerVisible && <CookieBanner />}
      {isPreferencesOpen && <CookiePreferencesModal />}
    </CookieConsentContext.Provider>
  )
}
