import { render, screen } from '@/test-utils/render-utils'

import { FormField, TextArea, TextInput } from '@/components/common/FormField'

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

  // ── Error ─────────────────────────────────────────────────────────────────

  it('renders error message when error prop is provided', () => {
    render(
      <FormField label="Nome" htmlFor="nome" error="Informe o nome da clínica.">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da clínica.')
  })

  it('error message has destructive text class', () => {
    render(
      <FormField label="Nome" htmlFor="nome" error="Campo obrigatório.">
        <input id="nome" />
      </FormField>,
    )
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('text-destructive')
  })

  it('does not render error message when error is absent', () => {
    render(
      <FormField label="Nome" htmlFor="nome">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('suppresses hint when error is provided', () => {
    render(
      <FormField label="Nome" htmlFor="nome" hint="Dica útil." error="Campo inválido.">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.queryByText('Dica útil.')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Campo inválido.')
  })

  it('keeps optional badge alongside error', () => {
    render(
      <FormField label="Nome" htmlFor="nome" optional error="Valor inválido.">
        <input id="nome" />
      </FormField>,
    )
    expect(screen.getByText('Opcional')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
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

describe('TextInput — placeholder contrast', () => {
  it('applies reduced-opacity placeholder class in light mode', () => {
    render(<TextInput placeholder="Texto de exemplo" data-testid="ti" />)
    const el = screen.getByTestId('ti')
    expect(el.className).toContain('placeholder:text-muted-foreground/55')
  })

  it('applies reduced-opacity placeholder class in dark mode', () => {
    render(<TextInput placeholder="Texto de exemplo" data-testid="ti" />)
    const el = screen.getByTestId('ti')
    expect(el.className).toContain('dark:placeholder:text-muted-foreground/45')
  })
})

describe('TextInput — invalid state', () => {
  it('includes aria-invalid border class', () => {
    render(<TextInput data-testid="ti" />)
    const el = screen.getByTestId('ti')
    expect(el.className).toContain('aria-invalid:border-destructive')
  })

  it('includes aria-invalid ring class', () => {
    render(<TextInput data-testid="ti" />)
    const el = screen.getByTestId('ti')
    expect(el.className).toContain('aria-invalid:ring-destructive/20')
  })

  it('has aria-invalid=true when passed', () => {
    render(<TextInput data-testid="ti" aria-invalid={true} />)
    expect(screen.getByTestId('ti')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('TextArea — placeholder contrast', () => {
  it('applies reduced-opacity placeholder class in light mode', () => {
    render(<TextArea placeholder="Observações" data-testid="ta" />)
    const el = screen.getByTestId('ta')
    expect(el.className).toContain('placeholder:text-muted-foreground/55')
  })

  it('applies reduced-opacity placeholder class in dark mode', () => {
    render(<TextArea placeholder="Observações" data-testid="ta" />)
    const el = screen.getByTestId('ta')
    expect(el.className).toContain('dark:placeholder:text-muted-foreground/45')
  })
})

describe('TextArea — invalid state', () => {
  it('includes aria-invalid border class', () => {
    render(<TextArea data-testid="ta" />)
    const el = screen.getByTestId('ta')
    expect(el.className).toContain('aria-invalid:border-destructive')
  })

  it('has aria-invalid=true when passed', () => {
    render(<TextArea data-testid="ta" aria-invalid={true} />)
    expect(screen.getByTestId('ta')).toHaveAttribute('aria-invalid', 'true')
  })
})
