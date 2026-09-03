import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import {
  UserEmailField,
  UserNameFields,
  UserPhoneField,
} from '@/components/common/UserIdentityFields'

describe('UserNameFields', () => {
  it('renders first and last name inputs with default ids', () => {
    render(
      <UserNameFields
        firstName="Ana"
        lastName="Martins"
        onFirstNameChange={vi.fn()}
        onLastNameChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana')
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Martins')
  })

  it('applies a field prefix to the input ids', () => {
    render(
      <UserNameFields
        firstName=""
        lastName=""
        onFirstNameChange={vi.fn()}
        onLastNameChange={vi.fn()}
        fieldPrefix="dentist-"
      />,
    )
    expect(screen.getByLabelText('Nome')).toHaveAttribute('id', 'dentist-firstName')
  })

  it('calls the change handlers when typing', async () => {
    const onFirstNameChange = vi.fn()
    const onLastNameChange = vi.fn()
    render(
      <UserNameFields
        firstName=""
        lastName=""
        onFirstNameChange={onFirstNameChange}
        onLastNameChange={onLastNameChange}
      />,
    )
    await userEvent.type(screen.getByLabelText('Nome'), 'A')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'B')
    expect(onFirstNameChange).toHaveBeenCalledWith('A')
    expect(onLastNameChange).toHaveBeenCalledWith('B')
  })
})

describe('UserEmailField', () => {
  it('renders the email input', () => {
    render(<UserEmailField email="ana@clinica.com" onEmailChange={vi.fn()} />)
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@clinica.com')
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
  })

  it('calls onEmailChange when typing', async () => {
    const onEmailChange = vi.fn()
    render(<UserEmailField email="" onEmailChange={onEmailChange} />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'a')
    expect(onEmailChange).toHaveBeenCalledWith('a')
  })
})

describe('UserPhoneField', () => {
  it('renders the phone value formatted', () => {
    render(<UserPhoneField phone="11987654321" onPhoneChange={vi.fn()} />)
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('(11) 98765-4321')
  })

  it('formats the value on change before calling onPhoneChange', async () => {
    const onPhoneChange = vi.fn()
    render(<UserPhoneField phone="" onPhoneChange={onPhoneChange} />)
    await userEvent.type(screen.getByLabelText(/telefone/i), '1')
    expect(onPhoneChange).toHaveBeenCalledWith('1')
  })

  it('renders the phoneError and marks the field invalid', () => {
    render(<UserPhoneField phone="" onPhoneChange={vi.fn()} phoneError="Telefone inválido" />)
    expect(screen.getByText('Telefone inválido')).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not mark the field invalid when there is no phoneError', () => {
    render(<UserPhoneField phone="" onPhoneChange={vi.fn()} />)
    expect(screen.getByLabelText(/telefone/i)).toHaveAttribute('aria-invalid', 'false')
  })
})
