import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen } from '@/test-utils/render-utils'

import { ModulesSection } from '@/features/marketing/components/landing/ModulesSection'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <ModulesSection />
    </LazyMotion>,
  )
}

describe('ModulesSection', () => {
  it('renders the section heading', () => {
    renderSection()
    expect(screen.getByRole('heading', { name: /nove módulos integrados/i })).toBeInTheDocument()
  })

  it('renders the nine module cards plus a "see all" link', () => {
    renderSection()
    // 9 module cards + 1 "Ver todas as funcionalidades" link
    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('links each module to its dedicated feature route', () => {
    renderSection()
    expect(screen.getByRole('link', { name: /agenda inteligente/i })).toHaveAttribute(
      'href',
      '/funcionalidades/agenda',
    )
    expect(screen.getByRole('link', { name: /gestão financeira/i })).toHaveAttribute(
      'href',
      '/funcionalidades/financeiro',
    )
    expect(screen.getByRole('link', { name: /ver todas as funcionalidades/i })).toHaveAttribute(
      'href',
      '/funcionalidades',
    )
  })
})
