import { render, screen } from '@/test-utils/render-utils'

import { HomeSection } from '@/features/home/components/HomeSection'

describe('HomeSection — content', () => {
  it('renders the title as a heading', () => {
    render(
      <HomeSection title="Agenda de hoje">
        <p>content</p>
      </HomeSection>,
    )
    expect(screen.getByRole('heading', { name: 'Agenda de hoje' })).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <HomeSection title="Agenda" description="Consultas do dia">
        <p>content</p>
      </HomeSection>,
    )
    expect(screen.getByText('Consultas do dia')).toBeInTheDocument()
  })

  it('does not render description element when omitted', () => {
    const { container } = render(
      <HomeSection title="Agenda">
        <p>content</p>
      </HomeSection>,
    )
    expect(container.querySelector('p.text-muted-foreground')).toBeNull()
  })

  it('renders children in the section body', () => {
    render(
      <HomeSection title="Agenda">
        <p>Corpo da seção</p>
      </HomeSection>,
    )
    expect(screen.getByText('Corpo da seção')).toBeInTheDocument()
  })

  it('renders the action slot when provided', () => {
    render(
      <HomeSection title="Agenda" action={<a href="/app/agendamentos">Ver agenda</a>}>
        <p>content</p>
      </HomeSection>,
    )
    expect(screen.getByRole('link', { name: 'Ver agenda' })).toBeInTheDocument()
  })

  it('does not render action area when omitted', () => {
    render(
      <HomeSection title="Agenda">
        <p>content</p>
      </HomeSection>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('HomeSection — accessibility', () => {
  it('wraps content in a <section> element (via PanelCard)', () => {
    const { container } = render(
      <HomeSection title="Teste">
        <p>body</p>
      </HomeSection>,
    )
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('heading level is h2', () => {
    render(
      <HomeSection title="Pagamentos pendentes">
        <p>content</p>
      </HomeSection>,
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Pagamentos pendentes')
  })
})
