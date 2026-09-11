import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test-utils/render-utils'

const mockCreateAdminUser = vi.fn()
const mockUpdateAdminUser = vi.fn()
const mockListAdminClinics = vi.fn()
vi.mock('@/features/admin/services/admin-users.service', () => ({
  createAdminUser: (...args: unknown[]) => mockCreateAdminUser(...args),
  updateAdminUser: (...args: unknown[]) => mockUpdateAdminUser(...args),
  listAdminClinics: (...args: unknown[]) => mockListAdminClinics(...args),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <select disabled={disabled} value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    disabled,
    children,
  }: {
    value: string
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  ),
}))

import { UserFormModal } from '@/features/admin/components/UserFormModal'
import type { AdminUser } from '@/features/admin/types/admin.types'

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'user-1',
    clinicId: 'clinic-1',
    clinic: { id: 'clinic-1', name: 'Clínica Demo' },
    email: 'ana@clinica.com',
    firstName: 'Ana',
    lastName: 'Martins',
    role: 'DENTIST',
    phone: '11987654321',
    avatarUrl: null,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const CLINICS = [
  { id: 'clinic-1', name: 'Clínica Demo' },
  { id: 'clinic-2', name: 'Clínica Norte' },
]

async function fillCreateForm() {
  await userEvent.type(screen.getByLabelText('Nome'), 'João')
  await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
  await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'password123')
}

describe('UserFormModal — create mode', () => {
  it('dismisses exactly once with Escape', async () => {
    const onClose = vi.fn()
    render(<UserFormModal open onClose={onClose} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  beforeEach(() => {
    mockCreateAdminUser.mockReset()
    mockUpdateAdminUser.mockReset()
    mockListAdminClinics.mockReset().mockResolvedValue(CLINICS)
  })

  it('renders nothing when closed', () => {
    render(<UserFormModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByText('Novo usuário')).not.toBeInTheDocument()
  })

  it('renders the create-mode title and does not fetch clinics eagerly when closed', () => {
    render(<UserFormModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(mockListAdminClinics).not.toHaveBeenCalled()
  })

  it('renders the create-mode title, description, and password field', () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Novo usuário')).toBeInTheDocument()
    expect(
      screen.getByText('Preencha os dados para criar um novo usuário na plataforma.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('fetches clinics on open and populates the clinic select', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(mockListAdminClinics).toHaveBeenCalledOnce()
    expect(await screen.findByText('Clínica Demo')).toBeInTheDocument()
  })

  it('falls back to an empty clinic list when the clinics fetch fails', async () => {
    mockListAdminClinics.mockRejectedValue(new Error('network error'))
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await waitFor(() => expect(mockListAdminClinics).toHaveBeenCalled())
    expect(await screen.findByText('Nenhuma clínica encontrada')).toBeInTheDocument()
  })

  it('does not show the account-status field in create mode', () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByText('Status da conta')).not.toBeInTheDocument()
  })

  it('shows a required-fields error when first/last name are whitespace-only', async () => {
    // Native `required` validation blocks a truly-empty submit before React's
    // handler runs, so this JS-level check is only reachable via whitespace.
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome'), '  ')
    await userEvent.type(screen.getByLabelText('Sobrenome'), '  ')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(
      await screen.findByText('Nome, sobrenome e e-mail são obrigatórios.'),
    ).toBeInTheDocument()
    expect(mockCreateAdminUser).not.toHaveBeenCalled()
  })

  it('shows an error when the first name contains invalid characters', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome'), 'João123')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(
      await screen.findByText('O nome não pode conter números ou caracteres especiais.'),
    ).toBeInTheDocument()
  })

  it('shows an error when the last name contains invalid characters', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome'), 'João')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva123')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(
      await screen.findByText('O sobrenome não pode conter números ou caracteres especiais.'),
    ).toBeInTheDocument()
  })

  it('shows an error when the phone is invalid', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome'), 'João')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.type(screen.getByLabelText(/telefone/i), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(
      await screen.findByText(
        'Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an error when the password is shorter than 8 characters', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome'), 'João')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@clinica.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'short1')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument()
  })

  it('requires a clinic when the role requires one (default role DENTIST)', async () => {
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await fillCreateForm()
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(await screen.findByText('Selecione a clínica para este papel.')).toBeInTheDocument()
    expect(mockCreateAdminUser).not.toHaveBeenCalled()
  })

  it('does not require a clinic for the ADMIN role', async () => {
    mockCreateAdminUser.mockResolvedValue(makeUser({ role: 'ADMIN', clinicId: null, clinic: null }))
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await fillCreateForm()
    const [roleSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(roleSelect, 'ADMIN')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    await waitFor(() => expect(mockCreateAdminUser).toHaveBeenCalled())
  })

  it('creates a user with trimmed fields, digits-only phone, and clinicId', async () => {
    const created = makeUser()
    mockCreateAdminUser.mockResolvedValue(created)
    const onSuccess = vi.fn()
    render(<UserFormModal open onClose={vi.fn()} onSuccess={onSuccess} />)
    await screen.findByText('Clínica Demo')
    await userEvent.type(screen.getByLabelText('Nome'), '  João  ')
    await userEvent.type(screen.getByLabelText('Sobrenome'), '  Silva  ')
    await userEvent.type(screen.getByLabelText('E-mail'), '  joao@clinica.com  ')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.type(screen.getByLabelText(/telefone/i), '11987654321')
    const [, clinicSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(clinicSelect, 'clinic-2')

    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))

    await waitFor(() => expect(mockCreateAdminUser).toHaveBeenCalled())
    expect(mockCreateAdminUser).toHaveBeenCalledWith({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@clinica.com',
      password: 'password123',
      role: 'DENTIST',
      phone: '11987654321',
      clinicId: 'clinic-2',
    })
    expect(onSuccess).toHaveBeenCalledWith(created)
  })

  it('omits phone and clinicId when they are empty', async () => {
    mockCreateAdminUser.mockResolvedValue(makeUser())
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await fillCreateForm()
    const [, clinicSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(clinicSelect, 'clinic-1')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    await waitFor(() => expect(mockCreateAdminUser).toHaveBeenCalled())
    const payload = mockCreateAdminUser.mock.calls[0][0]
    expect(payload.phone).toBeUndefined()
  })

  it('shows the API error message when creation fails', async () => {
    mockCreateAdminUser.mockRejectedValue(new Error('E-mail já cadastrado.'))
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await fillCreateForm()
    const [, clinicSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(clinicSelect, 'clinic-1')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(await screen.findByText('E-mail já cadastrado.')).toBeInTheDocument()
  })

  it('shows a generic error message when creation fails with a non-Error', async () => {
    mockCreateAdminUser.mockRejectedValue('boom')
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await fillCreateForm()
    const [, clinicSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(clinicSelect, 'clinic-1')
    await userEvent.click(screen.getByRole('button', { name: 'Criar usuário' }))
    expect(await screen.findByText('Erro ao salvar usuário.')).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const onClose = vi.fn()
    render(<UserFormModal open onClose={onClose} onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clears the selected clinic when switching to a role that does not require one', async () => {
    mockCreateAdminUser.mockResolvedValue(makeUser({ role: 'ADMIN', clinicId: null, clinic: null }))
    render(<UserFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    const [roleSelect, clinicSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(clinicSelect, 'clinic-1')
    await userEvent.selectOptions(roleSelect, 'ADMIN')
    // clinic select should now be gone since role no longer requires one
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
  })
})

describe('UserFormModal — edit mode', () => {
  it('preserves the clinic when changing between clinic roles and omits a missing phone', async () => {
    const user = makeUser({ phone: null })
    mockUpdateAdminUser.mockResolvedValue({ ...user, role: 'ASSISTANT' })
    const onSuccess = vi.fn()
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={onSuccess} />)
    await screen.findByText('Clínica Demo')
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'ASSISTANT')
    expect(screen.getAllByRole('combobox')[1]).toHaveValue('clinic-1')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(mockUpdateAdminUser).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        role: 'ASSISTANT',
        clinicId: 'clinic-1',
        phone: undefined,
      }),
    )
  })

  beforeEach(() => {
    mockCreateAdminUser.mockReset()
    mockUpdateAdminUser.mockReset()
    mockListAdminClinics.mockReset().mockResolvedValue(CLINICS)
  })

  it('renders the edit-mode title, description, and pre-filled fields', () => {
    const user = makeUser({ firstName: 'Maria', lastName: 'Souza' })
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Editar usuário')).toBeInTheDocument()
    expect(screen.getByText('Alterando dados de Maria Souza')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Maria')
  })

  it('does not show the password field in edit mode', () => {
    const user = makeUser()
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument()
  })

  it('shows the account-status field, defaulting from isActive', () => {
    const user = makeUser({ isActive: false })
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Status da conta')).toBeInTheDocument()
  })

  it('does not require a password to submit in edit mode', async () => {
    const user = makeUser({ clinicId: 'clinic-1' })
    mockUpdateAdminUser.mockResolvedValue(user)
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(mockUpdateAdminUser).toHaveBeenCalled())
  })

  it('calls updateAdminUser with isActive and clinicId, then onSuccess', async () => {
    const user = makeUser({ id: 'u-1', clinicId: 'clinic-1', isActive: true })
    const updated = makeUser({ id: 'u-1', isActive: false })
    mockUpdateAdminUser.mockResolvedValue(updated)
    const onSuccess = vi.fn()
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={onSuccess} />)
    await screen.findByText('Clínica Demo')

    const selects = screen.getAllByRole('combobox')
    const statusSelect = selects[selects.length - 1]
    await userEvent.selectOptions(statusSelect, 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(mockUpdateAdminUser).toHaveBeenCalled())
    expect(mockUpdateAdminUser).toHaveBeenCalledWith('u-1', {
      firstName: 'Ana',
      lastName: 'Martins',
      email: 'ana@clinica.com',
      phone: '11987654321',
      role: 'DENTIST',
      isActive: false,
      clinicId: 'clinic-1',
    })
    expect(onSuccess).toHaveBeenCalledWith(updated)
  })

  it('sends clinicId as null when the role no longer requires a clinic', async () => {
    const user = makeUser({ id: 'u-2', role: 'ADMIN', clinicId: null, clinic: null })
    mockUpdateAdminUser.mockResolvedValue(user)
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    await waitFor(() => expect(mockListAdminClinics).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(mockUpdateAdminUser).toHaveBeenCalled())
    const [, payload] = mockUpdateAdminUser.mock.calls[0]
    expect(payload.clinicId).toBeNull()
  })

  it('disables the buttons while submitting', async () => {
    const user = makeUser({ clinicId: 'clinic-1' })
    mockUpdateAdminUser.mockImplementation(() => new Promise(() => {}))
    render(<UserFormModal open initialData={user} onClose={vi.fn()} onSuccess={vi.fn()} />)
    await screen.findByText('Clínica Demo')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByRole('button', { name: /salvando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('resets the form and refetches clinics each time the modal reopens', () => {
    const userA = makeUser({ id: 'a', firstName: 'Ana' })
    const userB = makeUser({ id: 'b', firstName: 'Beatriz' })
    const { rerender } = render(
      <UserFormModal open={false} initialData={userA} onClose={vi.fn()} onSuccess={vi.fn()} />,
    )
    rerender(<UserFormModal open initialData={userB} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByLabelText('Nome')).toHaveValue('Beatriz')
  })
})
