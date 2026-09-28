import { render, screen } from '@/test-utils/render-utils'

import { PasswordRequirements } from '@/components/common/PasswordRequirements'

describe('PasswordRequirements', () => {
  it('renders nothing when not visible and password is empty', () => {
    const { container } = render(<PasswordRequirements password="" visible={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the list when visible even if password is empty', () => {
    render(<PasswordRequirements password="" visible />)
    expect(screen.getByRole('list', { name: /requisitos de senha/i })).toBeInTheDocument()
  })

  it('renders the list when password is non-empty even if not visible', () => {
    render(<PasswordRequirements password="a" visible={false} />)
    expect(screen.getByRole('list', { name: /requisitos de senha/i })).toBeInTheDocument()
  })

  it('marks no requirements met for an empty password', () => {
    render(<PasswordRequirements password="" visible />)
    expect(screen.getByText('Mínimo de 8 caracteres')).toHaveClass('text-slate-500')
  })

  it('marks all requirements met for a strong password', () => {
    render(<PasswordRequirements password="Abcdef1!" visible />)
    expect(screen.getByText('Mínimo de 8 caracteres')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Letra maiúscula (A–Z)')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Letra minúscula (a–z)')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Número (0–9)')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Caractere especial (!@#$…)')).toHaveClass('text-emerald-700')
  })

  it('marks only the length requirement unmet for a long but simple password', () => {
    render(<PasswordRequirements password="abcdefgh" visible />)
    expect(screen.getByText('Mínimo de 8 caracteres')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Letra maiúscula (A–Z)')).toHaveClass('text-slate-500')
  })
})
