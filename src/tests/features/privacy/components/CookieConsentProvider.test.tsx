import { useCookieConsent } from '@/features/privacy/components/CookieConsentContext'
import { CookieConsentProvider } from '@/features/privacy/components/CookieConsentProvider'
import {
  COOKIE_CONSENT_KEY,
  COOKIE_POLICY_VERSION,
} from '@/features/privacy/utils/cookie-consent-storage'
import { fireEvent, render, screen } from '@testing-library/react'

function OpenPreferencesButton() {
  const { openPreferences } = useCookieConsent()
  return (
    <button type="button" onClick={openPreferences}>
      open-preferences
    </button>
  )
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockLogCookieConsent = vi.fn()

vi.mock('@/features/privacy/services/privacy.service', () => ({
  logCookieConsent: (...args: unknown[]) => mockLogCookieConsent(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderProvider() {
  return render(
    <CookieConsentProvider>
      <div data-testid="page-content">Page</div>
    </CookieConsentProvider>,
  )
}

// CookieBanner renders duplicate desktop and mobile button sets. jsdom does not
// apply CSS, so both sets are present in the DOM at the same time. This helper
// always returns the first match to avoid "found multiple elements" failures.
function getFirstButton(name: string) {
  return screen.getAllByRole('button', { name })[0]
}

function makeStoredConsent(
  overrides: Partial<{
    version: string
    source: 'banner' | 'preferences'
    preferences: boolean
    analytics: boolean
    marketing: boolean
  }> = {},
) {
  const {
    version = COOKIE_POLICY_VERSION,
    source = 'banner',
    preferences = false,
    analytics = false,
    marketing = false,
  } = overrides
  return JSON.stringify({
    version,
    timestamp: new Date().toISOString(),
    source,
    categories: { necessary: true, preferences, analytics, marketing },
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockLogCookieConsent.mockResolvedValue(undefined)
  localStorage.clear()
})

// ── Banner visibility ─────────────────────────────────────────────────────────

describe('banner visibility', () => {
  it('shows the cookie banner when no consent has been stored', () => {
    renderProvider()
    expect(screen.getByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument()
  })

  it('does not show the banner when valid consent is already stored', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, makeStoredConsent())
    renderProvider()
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument()
  })

  it('shows the banner when stored consent has a stale version', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, makeStoredConsent({ version: '0.0' }))
    renderProvider()
    expect(screen.getByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument()
  })
})

// ── Accept all ────────────────────────────────────────────────────────────────

describe('accept all', () => {
  it('persists consent with all categories enabled', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Aceitar todos os cookies'))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    })
    expect(saved.source).toBe('banner')
  })

  it('hides the banner after accepting all cookies', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Aceitar todos os cookies'))
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument()
  })
})

// ── Reject optional ───────────────────────────────────────────────────────────

describe('reject optional', () => {
  it('persists consent with only necessary cookies enabled', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Recusar cookies opcionais'))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    })
    expect(saved.source).toBe('banner')
  })

  it('hides the banner after rejecting optional cookies', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Recusar cookies opcionais'))
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument()
  })
})

// ── Preferences modal ─────────────────────────────────────────────────────────

describe('preferences modal', () => {
  it('opens the preferences modal when "Personalizar" is clicked', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    expect(screen.getByRole('dialog', { name: 'Preferências de cookies' })).toBeInTheDocument()
  })

  it('closes the modal when the X button is clicked', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.click(screen.getByRole('button', { name: 'Fechar preferências de cookies' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the modal when the Escape key is pressed', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not close the modal for a key other than Escape', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('persists the selected toggle state when "Salvar preferências" is clicked', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    // All optional categories start as false — toggle analytics on
    fireEvent.click(screen.getByRole('switch', { name: 'Ativar cookies análise' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar preferências' }))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: false,
      analytics: true,
      marketing: false,
    })
    expect(saved.source).toBe('preferences')
  })

  it('hides both the modal and the banner after saving preferences', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar preferências' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument()
  })

  it('toggles the "Preferências" and "Marketing" categories', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.click(screen.getByRole('switch', { name: 'Ativar cookies preferências' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Ativar cookies marketing' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar preferências' }))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: true,
      analytics: false,
      marketing: true,
    })
  })

  it('seeds the toggles from previously-stored preferences when reopened', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      makeStoredConsent({ analytics: true, marketing: false }),
    )
    // With valid consent already stored, the banner (and its "Personalizar"
    // trigger) isn't rendered — open the modal via the context directly, the
    // same way SiteFooter's cookie-preferences link does.
    render(
      <CookieConsentProvider>
        <OpenPreferencesButton />
      </CookieConsentProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'open-preferences' }))
    expect(screen.getByRole('switch', { name: 'Desativar cookies análise' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('rejects optional cookies from within the modal footer', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.click(screen.getByRole('button', { name: 'Recusar opcionais' }))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('accepts all cookies from within the modal footer', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar todos' }))
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!)
    expect(saved.categories).toEqual({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('the "Necessários" category switch is always on and cannot be toggled', () => {
    renderProvider()
    fireEvent.click(getFirstButton('Personalizar preferências de cookies'))
    const necessarySwitch = screen.getByRole('switch', {
      name: 'Cookies necessários são sempre necessários',
    })
    expect(necessarySwitch).toBeDisabled()
    expect(necessarySwitch).toHaveAttribute('aria-checked', 'true')
  })
})
