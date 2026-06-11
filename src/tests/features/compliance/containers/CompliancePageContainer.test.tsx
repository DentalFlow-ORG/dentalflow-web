import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import { CompliancePageContainer } from '@/features/compliance/containers/CompliancePageContainer'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@/features/compliance/components/PrivacyRequestsTab', () => ({
  PrivacyRequestsTab: () => <div data-testid="requests-tab">requests-tab</div>,
}))

vi.mock('@/features/compliance/components/AuditLogsTab', () => ({
  AuditLogsTab: () => <div data-testid="audit-tab">audit-tab</div>,
}))

vi.mock('@/features/compliance/components/CookieConsentLogsTab', () => ({
  CookieConsentLogsTab: () => <div data-testid="cookies-tab">cookies-tab</div>,
}))

// ── Header ────────────────────────────────────────────────────────────────────

describe('CompliancePageContainer — header', () => {
  it('renders "Compliance" as the page heading', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByRole('heading', { name: /^compliance$/i })).toBeInTheDocument()
  })

  it('renders the "Administração" eyebrow label', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByText(/gestão de conformidade lgpd/i)).toBeInTheDocument()
  })
})

// ── Tab navigation ────────────────────────────────────────────────────────────

describe('CompliancePageContainer — tab navigation', () => {
  it('renders the three tab buttons', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByRole('tab', { name: /solicitações lgpd/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /auditoria/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /consentimentos/i })).toBeInTheDocument()
  })

  it('selects "Solicitações LGPD" tab by default', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByRole('tab', { name: /solicitações lgpd/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /auditoria/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tab', { name: /consentimentos/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('shows PrivacyRequestsTab content by default', () => {
    render(<CompliancePageContainer />)
    expect(screen.getByTestId('requests-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('audit-tab')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cookies-tab')).not.toBeInTheDocument()
  })

  it('switches to AuditLogsTab when "Auditoria" is clicked', async () => {
    const user = userEvent.setup()
    render(<CompliancePageContainer />)

    await user.click(screen.getByRole('tab', { name: /auditoria/i }))

    expect(screen.getByTestId('audit-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('requests-tab')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /auditoria/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to CookieConsentLogsTab when "Consentimentos" is clicked', async () => {
    const user = userEvent.setup()
    render(<CompliancePageContainer />)

    await user.click(screen.getByRole('tab', { name: /consentimentos/i }))

    expect(screen.getByTestId('cookies-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('requests-tab')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /consentimentos/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('can switch back from a secondary tab to "Solicitações LGPD"', async () => {
    const user = userEvent.setup()
    render(<CompliancePageContainer />)

    await user.click(screen.getByRole('tab', { name: /auditoria/i }))
    await user.click(screen.getByRole('tab', { name: /solicitações lgpd/i }))

    expect(screen.getByTestId('requests-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('audit-tab')).not.toBeInTheDocument()
  })
})
