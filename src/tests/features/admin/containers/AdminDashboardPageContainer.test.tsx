import { render, screen } from '@/test-utils/render-utils'

import { ADMIN_NAV_CARDS } from '@/features/admin/constants/admin-display'
import { AdminDashboardPageContainer } from '@/features/admin/containers/AdminDashboardPageContainer'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

// ── Header / title ────────────────────────────────────────────────────────────

describe('AdminDashboardPageContainer — header', () => {
  it('renders "Painel da plataforma" as the page heading', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('heading', { name: /painel da plataforma/i })).toBeInTheDocument()
  })

  it('renders the "Administração" eyebrow', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('does NOT render the old "Painel administrativo" title', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.queryByText('Painel administrativo')).not.toBeInTheDocument()
  })
})

// ── Navigation cards ──────────────────────────────────────────────────────────

describe('AdminDashboardPageContainer — navigation cards', () => {
  it('renders a link to /app/admin/clinics', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('link', { name: /clínicas/i })).toHaveAttribute(
      'href',
      '/app/admin/clinics',
    )
  })

  it('renders a link to /app/admin/users', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('link', { name: /usuários/i })).toHaveAttribute(
      'href',
      '/app/admin/users',
    )
  })

  it('renders a link to /app/admin/financeiro', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('link', { name: /financeiro saas/i })).toHaveAttribute(
      'href',
      '/app/admin/financeiro',
    )
  })

  it('renders a link to /app/admin/compliance', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('link', { name: /compliance/i })).toHaveAttribute(
      'href',
      '/app/admin/compliance',
    )
  })

  it('renders all 4 admin nav cards', () => {
    render(<AdminDashboardPageContainer />)
    // There are exactly 4 nav card links (all with /app/admin/ prefix)
    const adminLinks = document.querySelectorAll('a[href^="/app/admin/"]')
    expect(adminLinks).toHaveLength(ADMIN_NAV_CARDS.length)
  })
})

// ── Descriptions ──────────────────────────────────────────────────────────────

describe('AdminDashboardPageContainer — descriptions', () => {
  it('renders a description for each nav card (no undefined rendered)', () => {
    render(<AdminDashboardPageContainer />)
    // Every card should render its description text — not the string "undefined"
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    // Each card description from ADMIN_NAV_CARDS is visible
    for (const { description } of ADMIN_NAV_CARDS) {
      expect(screen.getByText(description)).toBeInTheDocument()
    }
  })

  it('renders the Clínicas card description', () => {
    render(<AdminDashboardPageContainer />)
    expect(
      screen.getByText('Visualize e gerencie as clínicas cadastradas na plataforma.'),
    ).toBeInTheDocument()
  })

  it('renders the Compliance card description', () => {
    render(<AdminDashboardPageContainer />)
    expect(
      screen.getByText('Privacidade, LGPD, auditoria e solicitações de titulares.'),
    ).toBeInTheDocument()
  })
})

// ── Section ───────────────────────────────────────────────────────────────────

describe('AdminDashboardPageContainer — section structure', () => {
  it('renders the "Acessos rápidos" section heading', () => {
    render(<AdminDashboardPageContainer />)
    expect(screen.getByRole('heading', { name: /acessos rápidos/i })).toBeInTheDocument()
  })
})
