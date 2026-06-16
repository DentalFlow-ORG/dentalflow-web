type CookieCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing'

export type CookieConsent = {
  version: string
  timestamp: string
  source: 'banner' | 'preferences'
  categories: {
    necessary: true
    preferences: boolean
    analytics: boolean
    marketing: boolean
  }
}

export type CookieConsentContextValue = {
  consent: CookieConsent | null
  hasConsented: boolean
  isBannerVisible: boolean
  isPreferencesOpen: boolean
  acceptAll: () => void
  rejectOptional: () => void
  savePreferences: (prefs: Record<Exclude<CookieCategory, 'necessary'>, boolean>) => void
  openPreferences: () => void
  closePreferences: () => void
}
