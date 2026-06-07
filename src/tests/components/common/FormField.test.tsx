import { render, screen } from '@/test-utils/render-utils'

import { FormField } from '@/components/common/FormField'

describe('FormField', () => {
  // ── Label rendering ───────────────────────────────────────────────────────

  it('renders label text', () => {
    render(
      <FormField label="Nome" htmlFor="nome">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.getByText('Nome')).toBeInTheDocument()
  })

  it('associates label with the field via htmlFor', () => {
    render(
      <FormField label="Nome" htmlFor="nome">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  // ── Optional badge ────────────────────────────────────────────────────────

  it('does not render optional badge when optional prop is absent', () => {
    render(
      <FormField label="Valor" htmlFor="valor">
        <input id="valor" />
      </FormField>,
    )
    expect(screen.queryByText('Opcional')).not.toBeInTheDocument()
  })

  it('renders optional badge when optional prop is true', () => {
    render(
      <FormField label="Vencimento" htmlFor="due" optional>
        <input id="due" />
      </FormField>,
    )
    expect(screen.getByText('Opcional')).toBeInTheDocument()
  })

  it('optional badge has whitespace-nowrap to prevent label height increase', () => {
    render(
      <FormField label="Vencimento" htmlFor="due" optional>
        <input id="due" />
      </FormField>,
    )
    const badge = screen.getByText('Opcional')
    expect(badge.className).toMatch(/whitespace-nowrap/)
  })

  // ── Hint ──────────────────────────────────────────────────────────────────

  it('renders hint text when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" hint="Usado para login">
        <input id="email" />
      </FormField>,
    )
    expect(screen.getByText('Usado para login')).toBeInTheDocument()
  })

  it('does not render hint when not provided', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  // ── Children ──────────────────────────────────────────────────────────────

  it('renders children inside the field', () => {
    render(
      <FormField label="Nome" htmlFor="nome">
        <input id="nome" data-testid="nome-input" />
      </FormField>,
    )
    expect(screen.getByTestId('nome-input')).toBeInTheDocument()
  })
})
