import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'
import {
  setMockAuthState,
  resetAuthMocks,
  mockLogout,
} from '@/test-utils/mocks/auth'
import {
  mockNavigate,
  resetRouterMocks,
} from '@/test-utils/mocks/router'
import {
  makeOwnerUser,
  makeDentistUser,
  makeAssistantUser,
  makeAdminUser,
} from '@/test-utils/factories/user.factory'
import { makeBillingStatus } from '@/test-utils/factories/billing.factory'

vi.mock('@tanstack/react-router', async () => {
  const routerMock = await import('@/test-utils/mocks/router')
  return routerMock.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' as const, setTheme: vi.fn() }),
}))

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => null,
}))

function renderShell(
  billingStatus: ReturnType<typeof makeBillingStatus> | null = null,
) {
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
    renderShell(
      makeBillingStatus({ status: 'trialing', trialEndsAt: '2099-12-31T00:00:00.000Z' }),
    )
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
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/app/configuracoes/notificacoes')
    })
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
    agendaLinks.forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    })
  })
})
