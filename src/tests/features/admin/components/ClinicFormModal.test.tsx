import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

const mockCreateAdminClinic = vi.fn()
const mockUpdateAdminClinic = vi.fn()
vi.mock('@/features/admin/services/admin-clinics.service', () => ({
  createAdminClinic: (...args: unknown[]) => mockCreateAdminClinic(...args),
  updateAdminClinic: (...args: unknown[]) => mockUpdateAdminClinic(...args),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { ClinicFormModal } from '@/features/admin/components/ClinicFormModal'
import type { AdminClinic } from '@/features/admin/types/admin.types'

function makeClinic(overrides: Partial<AdminClinic> = {}): AdminClinic {
  return {
    id: 'clinic-1',
    name: 'Clínica Demo',
    isActive: true,
    ...overrides,
  }
}

describe('ClinicFormModal — create mode', () => {
  it('dismisses exactly once with Escape', async () => {
    const onClose = vi.fn()
    render(<ClinicFormModal open onClose={onClose} onSuccess={vi.fn()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  beforeEach(() => {
    mockCreateAdminClinic.mockReset()
    mockUpdateAdminClinic.mockReset()
  })

  it('renders nothing when closed', () => {
    render(<ClinicFormModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByText('Nova clínica')).not.toBeInTheDocument()
  })

  it('renders the create-mode title and description', () => {
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Nova clínica')).toBeInTheDocument()
    expect(
      screen.getByText('Cadastre uma nova clínica para vincular usuários e operações.'),
    ).toBeInTheDocument()
  })

  it('does not show the status field in create mode', () => {
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
  })

  it('shows a validation error when the name is shorter than 2 characters', async () => {
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome da clínica'), 'A')
    await userEvent.click(screen.getByRole('button', { name: 'Criar clínica' }))
    expect(
      await screen.findByText('Informe um nome de clínica com pelo menos 2 caracteres.'),
    ).toBeInTheDocument()
    expect(mockCreateAdminClinic).not.toHaveBeenCalled()
  })

  it('trims the name and calls createAdminClinic, then onSuccess', async () => {
    const created = makeClinic({ id: 'new-1', name: 'Nova Clínica' })
    mockCreateAdminClinic.mockResolvedValue(created)
    const onSuccess = vi.fn()
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText('Nome da clínica'), '  Nova Clínica  ')
    await userEvent.click(screen.getByRole('button', { name: 'Criar clínica' }))
    await screen.findByRole('button', { name: 'Criar clínica' })
    expect(mockCreateAdminClinic).toHaveBeenCalledWith({ name: 'Nova Clínica' })
    expect(onSuccess).toHaveBeenCalledWith(created)
  })

  it('shows the API error message when creation fails', async () => {
    mockCreateAdminClinic.mockRejectedValue(new Error('CNPJ já cadastrado.'))
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome da clínica'), 'Clínica X')
    await userEvent.click(screen.getByRole('button', { name: 'Criar clínica' }))
    expect(await screen.findByText('CNPJ já cadastrado.')).toBeInTheDocument()
  })

  it('shows a generic error message when creation fails with a non-Error', async () => {
    mockCreateAdminClinic.mockRejectedValue('some string error')
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome da clínica'), 'Clínica X')
    await userEvent.click(screen.getByRole('button', { name: 'Criar clínica' }))
    expect(await screen.findByText('Erro ao salvar clínica.')).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const onClose = vi.fn()
    render(<ClinicFormModal open onClose={onClose} onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables the buttons while submitting', async () => {
    mockCreateAdminClinic.mockImplementation(() => new Promise(() => {}))
    render(<ClinicFormModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Nome da clínica'), 'Clínica X')
    await userEvent.click(screen.getByRole('button', { name: 'Criar clínica' }))
    expect(await screen.findByRole('button', { name: /salvando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})

describe('ClinicFormModal — edit mode', () => {
  beforeEach(() => {
    mockCreateAdminClinic.mockReset()
    mockUpdateAdminClinic.mockReset()
  })

  it('renders the edit-mode title, description, and pre-filled name', () => {
    const clinic = makeClinic({ name: 'Clínica Existente' })
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Editar clínica')).toBeInTheDocument()
    expect(screen.getByText('Alterando dados de Clínica Existente')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome da clínica')).toHaveValue('Clínica Existente')
  })

  it('shows the status field when isActive is defined, defaulting to Ativa', () => {
    const clinic = makeClinic({ isActive: true })
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('true')
  })

  it('defaults the status select to Inativa when isActive is false', () => {
    const clinic = makeClinic({ isActive: false })
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('false')
  })

  it('does not show the status field when isActive is undefined', () => {
    const clinic = makeClinic({ isActive: undefined })
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
  })

  it('calls updateAdminClinic with name and isActive, then onSuccess', async () => {
    const clinic = makeClinic({ id: 'c-1', name: 'Clínica X', isActive: true })
    const updated = makeClinic({ id: 'c-1', name: 'Clínica Y', isActive: false })
    mockUpdateAdminClinic.mockResolvedValue(updated)
    const onSuccess = vi.fn()
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={onSuccess} />)

    await userEvent.clear(screen.getByLabelText('Nome da clínica'))
    await userEvent.type(screen.getByLabelText('Nome da clínica'), 'Clínica Y')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await screen.findByRole('button', { name: 'Salvar alterações' })
    expect(mockUpdateAdminClinic).toHaveBeenCalledWith('c-1', {
      name: 'Clínica Y',
      isActive: false,
    })
    expect(onSuccess).toHaveBeenCalledWith(updated)
  })

  it('omits isActive from the update payload when the original clinic had it undefined', async () => {
    const clinic = makeClinic({ id: 'c-2', name: 'Clínica Z', isActive: undefined })
    mockUpdateAdminClinic.mockResolvedValue(clinic)
    render(<ClinicFormModal open initialData={clinic} onClose={vi.fn()} onSuccess={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await screen.findByRole('button', { name: 'Salvar alterações' })
    expect(mockUpdateAdminClinic).toHaveBeenCalledWith('c-2', { name: 'Clínica Z' })
  })

  it('resets the form each time the modal reopens with new initialData', () => {
    const clinicA = makeClinic({ id: 'a', name: 'Clínica A' })
    const clinicB = makeClinic({ id: 'b', name: 'Clínica B' })
    const { rerender } = render(
      <ClinicFormModal open={false} initialData={clinicA} onClose={vi.fn()} onSuccess={vi.fn()} />,
    )
    rerender(<ClinicFormModal open initialData={clinicB} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByLabelText('Nome da clínica')).toHaveValue('Clínica B')
  })
})
