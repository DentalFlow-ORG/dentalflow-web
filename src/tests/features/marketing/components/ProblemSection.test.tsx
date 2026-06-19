import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen } from '@/test-utils/render-utils'

import { ProblemSection } from '@/features/marketing/components/landing/ProblemSection'

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <ProblemSection />
    </LazyMotion>,
  )
}

describe('ProblemSection', () => {
  it('renders the section heading', () => {
    renderSection()
    expect(
      screen.getByRole('heading', { name: /gerir a clínica no improviso/i }),
    ).toBeInTheDocument()
  })

  it('renders the pain-point cards', () => {
    renderSection()
    expect(
      screen.getByRole('heading', { name: /agenda em planilhas e papel/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /sistemas que não se conversam/i }),
    ).toBeInTheDocument()
  })
})
