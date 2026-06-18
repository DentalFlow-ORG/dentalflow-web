import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen, userEvent } from '@/test-utils/render-utils'

import { DentalArchSection } from '@/features/marketing/components/landing/DentalArchSection'

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

// The arch visual is a lazy, purely decorative WebGL/SVG component — stub it so
// the section renders without three.js / Suspense timing in tests.
vi.mock('@/features/marketing/components/landing/DentalArch', () => ({
  DentalArch: () => <div data-testid="dental-arch" />,
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <DentalArchSection />
    </LazyMotion>,
  )
}

const WORKFLOW_LABELS = [
  'Agenda',
  'Pacientes',
  'Prontuário',
  'Financeiro',
  'Estoque',
  'Equipe',
  'Relatórios',
  'WhatsApp',
  'IA de gestão',
]

describe('DentalArchSection', () => {
  it('renders a stable section heading', () => {
    renderSection()
    expect(screen.getByRole('heading', { name: /arcada digital/i })).toBeInTheDocument()
  })

  it('renders a selectable chip for every clinic workflow', () => {
    renderSection()
    for (const label of WORKFLOW_LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('updates the detail panel when a different workflow is selected', async () => {
    const user = userEvent.setup()
    renderSection()

    // Agenda is selected by default.
    expect(screen.getByRole('heading', { level: 3, name: 'Agenda' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'WhatsApp' }))
    expect(screen.getByRole('heading', { level: 3, name: 'WhatsApp' })).toBeInTheDocument()
  })
})
