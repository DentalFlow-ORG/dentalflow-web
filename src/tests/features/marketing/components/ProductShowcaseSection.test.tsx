import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen, userEvent } from '@/test-utils/render-utils'

import { ProductShowcaseSection } from '@/features/marketing/components/landing/ProductShowcaseSection'

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <ProductShowcaseSection />
    </LazyMotion>,
  )
}

const TAB_LABELS = [
  'Agenda odontológica',
  'Prontuário do paciente',
  'Financeiro da clínica',
  'Estoque odontológico',
  'Equipe & produtividade',
]

describe('ProductShowcaseSection', () => {
  it('renders the section heading', () => {
    renderSection()
    expect(
      screen.getByRole('heading', { name: /como o dentalflow funciona no dia a dia/i }),
    ).toBeInTheDocument()
  })

  it('renders a tab for each dental product area', () => {
    renderSection()
    for (const label of TAB_LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('shows the selected area in the detail panel and switches on click', async () => {
    const user = userEvent.setup()
    renderSection()

    // First tab is active by default.
    expect(
      screen.getByRole('heading', { level: 3, name: 'Agenda odontológica' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Estoque odontológico' }))
    expect(
      screen.getByRole('heading', { level: 3, name: 'Estoque odontológico' }),
    ).toBeInTheDocument()
  })
})
