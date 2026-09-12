import type { ReactNode } from 'react'

import { render, screen } from '@/test-utils/render-utils'

import { featureDetailContents } from '@/features/marketing/data/public-content'
import { FeatureDetailPage } from '@/features/marketing/pages/FeatureDetailPage'

const agenda = featureDetailContents.agenda
const pacientes = featureDetailContents.pacientes

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const reveal = vi.hoisted(() => ({ isVisible: true }))
vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: reveal.isVisible }),
}))

beforeEach(() => {
  reveal.isVisible = true
})

vi.mock('@/features/marketing/components/FeatureMockups', () => ({
  FeatureMockup: () => <div data-testid="feature-mockup" />,
}))

// ── Hero ──────────────────────────────────────────────────────────────────────

describe('FeatureDetailPage — hero', () => {
  it('renders the h1 with content.hero', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByRole('heading', { level: 1, name: agenda.hero })).toBeInTheDocument()
  })

  it('renders content.heroSub', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByText(agenda.heroSub)).toBeInTheDocument()
  })

  it('primary CTA "Testar grátis" links to /acessar', () => {
    render(<FeatureDetailPage content={agenda} />)
    const links = screen.getAllByRole('link', { name: /Testar grátis/i })
    expect(links[0]).toHaveAttribute('href', '/acessar')
  })

  it('secondary CTA "Ver planos" links to /planos', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByRole('link', { name: /^Ver planos$/i })).toHaveAttribute('href', '/planos')
  })
})

// ── Problem / solution ────────────────────────────────────────────────────────

describe('FeatureDetailPage — problem / solution', () => {
  it('renders the "O desafio" label', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByText('O desafio')).toBeInTheDocument()
  })

  it('renders the "A solução DentalFlow" label', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByText('A solução DentalFlow')).toBeInTheDocument()
  })

  it('renders content.problemTitle as a heading', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByRole('heading', { name: agenda.problemTitle })).toBeInTheDocument()
  })
})

// ── Benefits ──────────────────────────────────────────────────────────────────

describe('FeatureDetailPage — benefits', () => {
  it('renders the "Principais benefícios" heading', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByRole('heading', { name: 'Principais benefícios' })).toBeInTheDocument()
  })

  it('renders each benefit from content.benefits', () => {
    render(<FeatureDetailPage content={agenda} />)
    for (const benefit of agenda.benefits) {
      expect(screen.getByText(benefit)).toBeInTheDocument()
    }
  })
})

// ── Workflow ──────────────────────────────────────────────────────────────────

describe('FeatureDetailPage — workflow', () => {
  it('renders "Como funciona na prática" heading', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByRole('heading', { name: 'Como funciona na prática' })).toBeInTheDocument()
  })

  it('renders all workflow step titles', () => {
    render(<FeatureDetailPage content={agenda} />)
    for (const step of agenda.workflow) {
      expect(screen.getByRole('heading', { name: step.title })).toBeInTheDocument()
    }
  })
})

// ── Roles ─────────────────────────────────────────────────────────────────────

describe('FeatureDetailPage — roles', () => {
  it('renders role names from content.roles', () => {
    render(<FeatureDetailPage content={agenda} />)
    for (const role of agenda.roles) {
      expect(screen.getByText(role.role)).toBeInTheDocument()
    }
  })

  it('roles with a ROLE_ROUTES match render as links with correct href', () => {
    render(<FeatureDetailPage content={agenda} />)
    // agenda has 'Secretária / Recepção' → /para-secretarias
    const link = screen.getByRole('link', { name: /Secretária \/ Recepção/i })
    expect(link).toHaveAttribute('href', '/para-secretarias')
  })
})

// ── Plan note and disclaimer ──────────────────────────────────────────────────

describe('FeatureDetailPage — plan note and disclaimer', () => {
  it('renders content.planNote', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByText(agenda.planNote)).toBeInTheDocument()
  })

  it('renders disclaimer when content.disclaimer is set', () => {
    render(<FeatureDetailPage content={pacientes} />)
    expect(screen.getByText(pacientes.disclaimer!)).toBeInTheDocument()
  })

  it('does not render disclaimer when content has none', () => {
    render(<FeatureDetailPage content={agenda} />)
    // agenda has no disclaimer; the amber alert box should not be present
    expect(screen.queryByText(/cadastros internos/i)).not.toBeInTheDocument()
  })
})

// ── Related features ──────────────────────────────────────────────────────────

describe('FeatureDetailPage — related features', () => {
  it('renders the 3 sibling related feature labels for agenda', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(screen.getByText('Prontuário eletrônico')).toBeInTheDocument()
    expect(screen.getByText('Gestão financeira')).toBeInTheDocument()
    expect(screen.getByText('Pacientes')).toBeInTheDocument()
  })

  it('does not include the current feature label in the related section', () => {
    render(<FeatureDetailPage content={agenda} />)
    // The related grid should not list "Agenda inteligente" as a sibling card
    expect(screen.queryByText('Agenda inteligente')).not.toBeInTheDocument()
  })
})

// ── Final CTA ─────────────────────────────────────────────────────────────────

describe('FeatureDetailPage — final CTA', () => {
  it('final CTA heading includes content.title.toLowerCase()', () => {
    render(<FeatureDetailPage content={agenda} />)
    expect(
      screen.getByRole('heading', {
        name: new RegExp(agenda.title.toLowerCase(), 'i'),
      }),
    ).toBeInTheDocument()
  })
})

describe('FeatureDetailPage — before the reveal animation runs', () => {
  it('renders the hero and closing CTA in their pre-reveal hidden state', () => {
    reveal.isVisible = false
    render(<FeatureDetailPage content={agenda} />)
    expect(document.querySelectorAll('.opacity-0').length).toBeGreaterThan(0)
  })
})
