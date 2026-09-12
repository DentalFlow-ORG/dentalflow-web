import { render, screen } from '@/test-utils/render-utils'

import { SectionHeading } from '@/components/common/SectionHeading'

describe('SectionHeading', () => {
  it('renders eyebrow and title', () => {
    render(<SectionHeading eyebrow="Recursos" title="Tudo em um só lugar" />)
    expect(screen.getByText('Recursos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tudo em um só lugar' })).toBeInTheDocument()
  })

  it('does not render a description when omitted', () => {
    const { container } = render(<SectionHeading eyebrow="Recursos" title="Título" />)
    expect(container.querySelector('p.mt-5')).not.toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<SectionHeading eyebrow="Recursos" title="Título" description="Descrição da seção" />)
    expect(screen.getByText('Descrição da seção')).toBeInTheDocument()
  })

  it('centers content when align="center"', () => {
    const { container } = render(
      <SectionHeading eyebrow="Recursos" title="Título" align="center" />,
    )
    expect(container.firstChild).toHaveClass('mx-auto', 'text-center')
  })

  it('applies dark tone classes', () => {
    render(<SectionHeading eyebrow="Recursos" title="Título" tone="dark" />)
    expect(screen.getByRole('heading', { name: 'Título' })).toHaveClass('text-white')
  })

  it('applies the dark tone to the description as well', () => {
    render(
      <SectionHeading
        eyebrow="Recursos"
        title="Título"
        description="Descrição da seção"
        tone="dark"
      />,
    )
    expect(screen.getByText('Descrição da seção')).toHaveClass('text-slate-300')
  })
})
