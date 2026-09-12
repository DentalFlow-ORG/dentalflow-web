import { AppShell } from '@/components/layout/AppShell'
import { makeBillingStatus } from '@/test-utils/factories/billing.factory'
import {
  makeAdminUser,
  makeAssistantUser,
  makeDentistUser,
  makeOwnerUser,
} from '@/test-utils/factories/user.factory'
import { mockLogout, resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks, setMockPathname } from '@/test-utils/mocks/router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

vi.mock('@tanstack/react-router', async () => {
  const routerMock = await import('@/test-utils/mocks/router')
  return routerMock.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

const themeState = { theme: 'light' as 'light' | 'dark' }
const mockSetTheme = vi.fn((next: 'light' | 'dark') => {
  themeState.theme = next
})

vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: themeState.theme, setTheme: mockSetTheme }),
}))

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => null,
}))

function renderShell(billingStatus: ReturnType<typeof makeBillingStatus> | null = null) {
  return render(
    <AppShell billingStatus={billingStatus}>
      <div data-testid="shell-child">content</div>
    </AppShell>,
  )
}

beforeEach(() => {
  resetAuthMocks()
  resetRouterMocks()
  localStorage.clear()
  themeState.theme = 'light'
  mockSetTheme.mockClear()
})

// ─── Render ───────────────────────────────────────────────────────────────────

describe('render', () => {
  it('renders children inside the shell', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()
    expect(screen.getByTestId('shell-child')).toBeInTheDocument()
  })

  it('shows user display name in the header', () => {
    setMockAuthState({
      user: makeOwnerUser({ firstName: 'João', lastName: 'Silva' }),
      isAuthenticated: true,
    })
    renderShell()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('calls mockLogout and navigates to / when Sair is clicked', async () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledOnce()
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})

// ─── Role-based navigation ────────────────────────────────────────────────────

describe('role-based navigation', () => {
  it('shows OWNER nav items and hides items exclusive to other roles', () => {
    setMockAuthState({
      user: makeOwnerUser(),
      isAuthenticated: true,
    })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    // TOP_ITEMS and footer items are always accessible (not inside a Collapsible)
    expect(screen.getAllByRole('link', { name: 'Início' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Configurações' }).length).toBeGreaterThan(0)

    // OWNER mobile primary nav items (/app/agendamentos, /app/pacientes, /app/prontuario)
    expect(screen.getAllByRole('link', { name: 'Agenda' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Pacientes' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Prontuários' }).length).toBeGreaterThan(0)

    // Equipe is only in the desktop Gestão group — expand it first
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }))
    expect(screen.getAllByRole('link', { name: 'Equipe' }).length).toBeGreaterThan(0)

    // Items exclusive to other roles
    expect(screen.queryAllByRole('link', { name: 'Minha agenda' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Usuários' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Clínicas' })).toHaveLength(0)
  })

  it('shows DENTIST nav items and hides OWNER/ADMIN items', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    renderShell()

    expect(screen.getAllByRole('link', { name: 'Início' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Minha agenda' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Prontuários' }).length).toBeGreaterThan(0)

    // Items not visible to DENTIST
    expect(screen.queryAllByRole('link', { name: 'Agenda' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Equipe' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Estoque' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Configurações' })).toHaveLength(0)
  })

  it('shows ADMIN nav items and hides OWNER/DENTIST items', () => {
    setMockAuthState({ user: makeAdminUser(), isAuthenticated: true })
    renderShell()

    // ADMIN mobile primary nav items (/app/admin, /app/admin/users, /app/admin/clinics, /app/admin/financeiro)
    expect(screen.getAllByRole('link', { name: 'Início' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Usuários' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Clínicas' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Financeiro SaaS' }).length).toBeGreaterThan(0)

    // Compliance is only in the desktop Plataforma group — expand it first
    fireEvent.click(screen.getByRole('button', { name: 'Plataforma' }))
    expect(screen.getAllByRole('link', { name: 'Compliance' }).length).toBeGreaterThan(0)

    // Items exclusive to other roles
    expect(screen.queryAllByRole('link', { name: 'Agenda' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Equipe' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Configurações' })).toHaveLength(0)
  })

  it('shows ASSISTANT nav items and hides OWNER-only items', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    // ASSISTANT mobile primary nav items (/app, /app/agendamentos, /app/pacientes, /app/estoque)
    expect(screen.getAllByRole('link', { name: 'Início' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Agenda' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Pacientes' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Estoque' }).length).toBeGreaterThan(0)

    // OWNER-only items not visible to ASSISTANT
    expect(screen.queryAllByRole('link', { name: 'Equipe' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Configurações' })).toHaveLength(0)
  })
})

// ─── Plan-gated navigation ────────────────────────────────────────────────────

describe('plan-gated navigation', () => {
  it('hides plan-gated items for starter plan', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'starter' }))

    expect(screen.queryAllByRole('link', { name: 'Estoque' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Financeiro' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Notas fiscais' })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Relatórios' })).toHaveLength(0)
  })

  it('shows plan-gated items for professional plan', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    // All plan-gated items are inside the Gestão group — expand it first
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }))

    expect(screen.getAllByRole('link', { name: 'Estoque' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Financeiro' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Notas fiscais' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Relatórios' }).length).toBeGreaterThan(0)
  })
})

// ─── TrialBanner ──────────────────────────────────────────────────────────────

describe('TrialBanner', () => {
  it('renders the trial banner when status is trialing and trialEndsAt is set', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ status: 'trialing', trialEndsAt: '2099-12-31T00:00:00.000Z' }))
    expect(screen.getByText(/Teste grátis ativo/)).toBeInTheDocument()
  })

  it('does not render the trial banner when status is active', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ status: 'active', trialEndsAt: null }))
    expect(screen.queryByText(/Teste grátis ativo/)).not.toBeInTheDocument()
  })

  it('does not render the trial banner when status is trialing but trialEndsAt is null', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ status: 'trialing', trialEndsAt: null }))
    expect(screen.queryByText(/Teste grátis ativo/)).not.toBeInTheDocument()
  })
})

// ─── ASSISTANT Notificações nav item ─────────────────────────────────────────

describe('ASSISTANT Notificações footer nav', () => {
  it('ASSISTANT sees Notificações link pointing to /app/configuracoes/notificacoes', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    renderShell()
    const links = screen.getAllByRole('link', { name: 'Notificações' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/app/configuracoes/notificacoes')
    }
  })

  it('ASSISTANT still does not see Configurações link for /app/configuracoes', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    renderShell()
    expect(screen.queryAllByRole('link', { name: 'Configurações' })).toHaveLength(0)
  })

  it('OWNER does not see a separate Notificações footer link', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()
    expect(screen.queryAllByRole('link', { name: 'Notificações' })).toHaveLength(0)
  })

  it('DENTIST does not see Notificações footer link', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    renderShell()
    expect(screen.queryAllByRole('link', { name: 'Notificações' })).toHaveLength(0)
  })
})

// ─── Active route ─────────────────────────────────────────────────────────────

describe('active route', () => {
  it('sets aria-current="page" on the link matching the current pathname', () => {
    // Default pathname after beforeEach is '/app'; OWNER's Início TOP_ITEM (exact match to /app) should be active.
    // Both desktop sidebar and mobile nav Início links get aria-current="page".
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    const activeLinks = screen
      .getAllByRole('link', { name: 'Início' })
      .filter((el) => el.getAttribute('aria-current') === 'page')
    expect(activeLinks.length).toBeGreaterThan(0)

    // Agenda is in mobile primary nav for OWNER (not active at '/app')
    const agendaLinks = screen.getAllByRole('link', { name: 'Agenda' })
    for (const link of agendaLinks) {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    }
  })
})

// ─── Mobile More Sheet ────────────────────────────────────────────────────────

describe('Mobile More Sheet', () => {
  it('opens the dialog when the Mais button is clicked', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }))
    expect(screen.getByRole('dialog', { name: 'Mais opções' })).toBeInTheDocument()
  })

  it('dialog contains secondary nav items for OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'Mais' }))
    const dialog = screen.getByRole('dialog', { name: 'Mais opções' })
    // Configurações is an OWNER secondary nav item (not in primary routes)
    expect(dialog).toContainElement(screen.getByRole('link', { name: 'Configurações' }))
  })

  it('closes the dialog when the Fechar button is clicked', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'Mais' }))
    expect(screen.getByRole('dialog', { name: 'Mais opções' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the dialog when Escape is pressed', async () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'Mais' }))
    expect(screen.getByRole('dialog', { name: 'Mais opções' })).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ─── Theme toggle ─────────────────────────────────────────────────────────────

describe('theme toggle', () => {
  it('offers to switch to dark while the light theme is active', async () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    const toggle = screen.getByRole('button', { name: 'Tema claro' })
    fireEvent.click(toggle)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('offers to switch back to light while the dark theme is active', () => {
    themeState.theme = 'dark'
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    const toggle = screen.getByRole('button', { name: 'Tema escuro' })
    expect(screen.queryByRole('button', { name: 'Tema claro' })).not.toBeInTheDocument()

    fireEvent.click(toggle)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

// ─── Sidebar group persistence ────────────────────────────────────────────────

describe('sidebar group persistence', () => {
  it('restores the groups a previous session left open', () => {
    localStorage.setItem('dentalflow.sidebar.groups', JSON.stringify({ Gestão: true }))
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    // Equipe only renders while the Gestão group is expanded.
    expect(screen.getAllByRole('link', { name: 'Equipe' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Gestão' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('persists a group the user expands', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }))

    const stored = JSON.parse(localStorage.getItem('dentalflow.sidebar.groups') ?? '{}')
    expect(stored.Gestão).toBe(true)
  })

  it('ignores unreadable stored group state and starts collapsed', () => {
    localStorage.setItem('dentalflow.sidebar.groups', 'not-json')
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    expect(screen.getByRole('button', { name: 'Gestão' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('highlights a group that contains the current route', () => {
    setMockPathname('/app/equipe')
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ planKey: 'professional' }))

    expect(screen.getByText('Gestão')).toHaveClass('text-sidebar-primary')
  })
})

// ─── Absent user ──────────────────────────────────────────────────────────────

describe('absent authenticated user', () => {
  it('falls back to a generic name and renders no role navigation', () => {
    setMockAuthState({ user: null, isAuthenticated: false })
    renderShell()

    expect(screen.getByText('Usuário')).toBeInTheDocument()
    expect(screen.queryAllByRole('link', { name: 'Pacientes' })).toHaveLength(0)
    expect(screen.getByTestId('shell-child')).toBeInTheDocument()
  })
})

// ─── Role without a mobile nav configuration ──────────────────────────────────

describe('role without mobile primary routes', () => {
  it('renders no primary mobile nav for a role the mobile map does not configure', () => {
    // MOBILE_PRIMARY_ROUTES_BY_ROLE is a Partial map; PATIENT is a valid
    // AuthUserRole with no entry, so every visible item must fall to the
    // secondary "Mais" sheet instead of the primary bar.
    setMockAuthState({ user: makeOwnerUser({ role: 'PATIENT' }), isAuthenticated: true })
    renderShell()

    // No navigation item admits PATIENT, so the shell still frames its content
    // but offers neither a primary bar nor the secondary sheet.
    expect(screen.getByTestId('shell-child')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

// ─── Pinned footer item ───────────────────────────────────────────────────────

describe('pinned footer navigation', () => {
  it('marks the pinned settings item as the current page on its own route', () => {
    setMockPathname('/app/configuracoes')
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell()

    const settingsLinks = screen.getAllByRole('link', { name: 'Configurações' })
    expect(settingsLinks.some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
    expect(settingsLinks.some((link) => link.className.includes('text-sidebar-primary'))).toBe(true)
  })
})

// ─── Trial banner day counts ──────────────────────────────────────────────────

describe('TrialBanner remaining days', () => {
  // The banner rounds up, so a trial ending in N-and-a-bit days reads as N + 1.
  function renderTrialEndingIn(days: number) {
    const endsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    renderShell(makeBillingStatus({ status: 'trialing', trialEndsAt: endsAt }))
  }

  it('uses the singular form on the last day', () => {
    renderTrialEndingIn(0.5)
    expect(screen.getByText(/Teste grátis ativo · 1 dia restante$/)).toBeInTheDocument()
  })

  it('uses the plural form with more than one day left', () => {
    renderTrialEndingIn(4.5)
    expect(screen.getByText(/Teste grátis ativo · 5 dias restantes$/)).toBeInTheDocument()
  })

  it('says the trial expires today once the end date has passed', () => {
    renderTrialEndingIn(-1)
    expect(screen.getByText(/Teste grátis ativo · expira hoje$/)).toBeInTheDocument()
  })
})
