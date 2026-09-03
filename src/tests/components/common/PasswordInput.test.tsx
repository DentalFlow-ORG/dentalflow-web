import userEvent from '@testing-library/user-event'
import { Lock } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { PasswordInput } from '@/components/common/PasswordInput'

describe('PasswordInput', () => {
  it('starts as a password field', () => {
    render(<PasswordInput placeholder="Senha" />)
    expect(screen.getByPlaceholderText('Senha')).toHaveAttribute('type', 'password')
  })

  it('toggles visibility when the button is clicked', async () => {
    render(<PasswordInput placeholder="Senha" />)
    const input = screen.getByPlaceholderText('Senha')
    const toggle = screen.getByRole('button', { name: 'Mostrar senha' })

    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders the optional icon', () => {
    const { container } = render(<PasswordInput icon={Lock} placeholder="Senha" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('disables the toggle button when the input is disabled', () => {
    render(<PasswordInput placeholder="Senha" disabled />)
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeDisabled()
  })

  it('applies the auth variant styling', () => {
    render(<PasswordInput placeholder="Senha" variant="auth" />)
    expect(screen.getByPlaceholderText('Senha')).toHaveClass('border-0')
  })
})
