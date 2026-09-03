import userEvent from '@testing-library/user-event'
import { Mail } from 'lucide-react'

import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { AuthTextField } from '@/features/auth/components/AuthTextField'

describe('AuthTextField — text mode', () => {
  it('renders a text input with label and value', () => {
    render(
      <AuthTextField
        label="E-mail"
        placeholder="seu@email.com"
        name="email"
        value="a@b.com"
        onChange={vi.fn()}
      />,
    )
    const input = screen.getByLabelText('E-mail')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('a@b.com')
  })

  it('defaults to type text and required=true', () => {
    render(
      <AuthTextField label="Nome" placeholder="Nome" name="name" value="" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Nome')).toBeRequired()
  })

  it('renders the optional icon', () => {
    const { container } = render(
      <AuthTextField
        label="E-mail"
        placeholder="e-mail"
        name="email"
        value=""
        icon={Mail}
        onChange={vi.fn()}
      />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onChange with the new value', async () => {
    const onChange = vi.fn()
    render(
      <AuthTextField label="Nome" placeholder="Nome" name="name" value="" onChange={onChange} />,
    )
    await userEvent.type(screen.getByLabelText('Nome'), 'A')
    expect(onChange).toHaveBeenCalledWith('A')
  })

  // NOTE: for non-password fields, AuthTextField accepts onFocus/onBlur props
  // but does not wire them to the rendered <input> — only the password branch
  // (via PasswordInput's prop spread) does. Documenting actual behavior here
  // rather than asserting the (currently unreachable) intended behavior.
  it('does not currently forward onFocus/onBlur to the text input', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(
      <AuthTextField
        label="Nome"
        placeholder="Nome"
        name="name"
        value=""
        onChange={vi.fn()}
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    )
    const input = screen.getByLabelText('Nome')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(onFocus).not.toHaveBeenCalled()
    expect(onBlur).not.toHaveBeenCalled()
  })
})

describe('AuthTextField — password mode', () => {
  it('renders a PasswordInput with toggle visibility', async () => {
    render(
      <AuthTextField
        label="Senha"
        placeholder="Senha"
        name="password"
        type="password"
        value="secret"
        onChange={vi.fn()}
      />,
    )
    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('calls onChange for the password field', async () => {
    const onChange = vi.fn()
    render(
      <AuthTextField
        label="Senha"
        placeholder="Senha"
        name="password"
        type="password"
        value=""
        onChange={onChange}
      />,
    )
    await userEvent.type(screen.getByLabelText('Senha'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })
})
