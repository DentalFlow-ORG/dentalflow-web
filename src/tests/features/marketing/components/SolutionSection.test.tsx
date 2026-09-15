import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen } from '@/test-utils/render-utils'

import { SolutionSection } from '@/features/marketing/components/landing/SolutionSection'

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

// The orbit is a lazy, purely decorative visual — stub it so the section
// renders without Suspense timing in tests.
vi.mock('@/features/marketing/components/landing/FlowOrbit', () => ({
  default: () => <div data-testid="flow-orbit" />,
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <SolutionSection />
    </LazyMotion>,
  )
}

describe('SolutionSection', () => {
  it('renders the section heading', () => {
    renderSection()
    expect(screen.getByRole('heading', { name: /fluxo inteiro da clínica/i })).toBeInTheDocument()
  })

  it('renders every step of the patient journey flow', () => {
    renderSection()
    for (const label of [
      'Cadastro',
      'Agendamento',
      'Confirmação',
      'Atendimento',
      'Pagamento',
      'Decisão',
    ]) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument()
    }
  })
})
