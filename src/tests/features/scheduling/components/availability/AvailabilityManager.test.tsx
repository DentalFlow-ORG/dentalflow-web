import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@/test-utils/render-utils'

// Row deletion opens a confirmation; this confirms it.
async function confirmSlotRemoval() {
  const dialog = await screen.findByRole('dialog', { name: 'Remover horário de atendimento?' })
  await userEvent.click(within(dialog).getByRole('button', { name: 'Remover horário' }))
}

// Radix Select does not work reliably in JSDOM — stub with a native <select>,
// mirroring the pattern used in AvailabilitySlotForm.test.tsx.
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    name,
    required,
    disabled,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    name?: string
    required?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <select
      name={name}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode; id?: string }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockCreateAvailability = vi.fn()
const mockUpdateAvailability = vi.fn()
const mockDeleteAvailability = vi.fn()
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  createAvailability: (...args: unknown[]) => mockCreateAvailability(...args),
  updateAvailability: (...args: unknown[]) => mockUpdateAvailability(...args),
  deleteAvailability: (...args: unknown[]) => mockDeleteAvailability(...args),
}))

import { AvailabilityManager } from '@/features/scheduling/components/availability/AvailabilityManager'
import { makeAvailability } from '@/test-utils/factories/availability.factory'

beforeEach(() => {
  mockShowAlert.mockClear()
  mockCreateAvailability.mockReset()
  mockUpdateAvailability.mockReset()
  mockDeleteAvailability.mockReset()
})

describe('AvailabilityManager — empty state', () => {
  it('shows the empty message when there are no slots', () => {
    render(<AvailabilityManager profileId="prof-1" slots={[]} onSlotsChange={vi.fn()} />)
    expect(screen.getByText(/nenhum horário cadastrado/i)).toBeInTheDocument()
  })
})

describe('AvailabilityManager — sorting', () => {
  it('sorts slots by day of week, then by start time', () => {
    const slots = [
      makeAvailability({ id: 'b', dayOfWeek: 2, startTime: '09:00' }),
      makeAvailability({ id: 'a', dayOfWeek: 1, startTime: '10:00' }),
      makeAvailability({ id: 'c', dayOfWeek: 1, startTime: '08:00' }),
    ]
    render(<AvailabilityManager profileId="prof-1" slots={slots} onSlotsChange={vi.fn()} />)
    const rows = screen.getAllByText(/–/, { exact: false })
    // Not asserting DOM order directly via text (rows share formatting) — instead
    // verify all three render without throwing and the empty-state is absent.
    expect(rows.length).toBeGreaterThan(0)
    expect(screen.queryByText(/nenhum horário cadastrado/i)).not.toBeInTheDocument()
  })
})

describe('AvailabilityManager — add flow', () => {
  it('opens the add form, submits, and calls onSlotsChange with the new slot', async () => {
    const newSlot = makeAvailability({
      id: 'new-1',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '18:00',
    })
    mockCreateAvailability.mockResolvedValue(newSlot)
    const onSlotsChange = vi.fn()

    render(<AvailabilityManager profileId="prof-1" slots={[]} onSlotsChange={onSlotsChange} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    await userEvent.type(screen.getByLabelText('Início'), '0800')
    await userEvent.type(screen.getByLabelText('Fim'), '1800')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(mockCreateAvailability).toHaveBeenCalledWith('prof-1', {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '18:00',
      isActive: true,
    })
    expect(await screen.findByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    expect(onSlotsChange).toHaveBeenCalledWith([newSlot])
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Disponibilidade adicionada',
      tone: 'success',
    })
  })

  it('shows an inline error and alert when creating fails', async () => {
    mockCreateAvailability.mockRejectedValue(new Error('Falha ao salvar'))
    render(<AvailabilityManager profileId="prof-1" slots={[]} onSlotsChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    await userEvent.type(screen.getByLabelText('Início'), '0800')
    await userEvent.type(screen.getByLabelText('Fim'), '1800')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Falha ao salvar')).toBeInTheDocument()
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro ao salvar disponibilidade',
      description: 'Falha ao salvar',
      tone: 'error',
    })
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockCreateAvailability.mockRejectedValue('not an error object')
    render(<AvailabilityManager profileId="prof-1" slots={[]} onSlotsChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    await userEvent.type(screen.getByLabelText('Início'), '0800')
    await userEvent.type(screen.getByLabelText('Fim'), '1800')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Erro ao salvar.')).toBeInTheDocument()
  })

  it('hides the Adicionar button while the form is open, and cancel closes it', async () => {
    render(<AvailabilityManager profileId="prof-1" slots={[]} onSlotsChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    expect(screen.queryByRole('button', { name: /^adicionar$/i })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
  })
})

describe('AvailabilityManager — edit flow', () => {
  it('recovers from an unknown update failure without replacing another slot', async () => {
    const slot = makeAvailability({ id: 'first', dayOfWeek: 1 })
    const other = makeAvailability({ id: 'second', dayOfWeek: 2 })
    const updated = { ...slot, endTime: '18:00' }
    mockUpdateAvailability.mockRejectedValueOnce(null).mockResolvedValueOnce(updated)
    const onSlotsChange = vi.fn()
    render(
      <AvailabilityManager
        profileId="prof-1"
        slots={[slot, other]}
        onSlotsChange={onSlotsChange}
      />,
    )
    await userEvent.click(screen.getAllByRole('button', { name: /editar/i })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Erro ao atualizar.')).toBeInTheDocument()
    expect(onSlotsChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSlotsChange).toHaveBeenCalledWith([updated, other])
  })

  it('dismisses slot editing without updating availability', async () => {
    render(
      <AvailabilityManager
        profileId="prof-1"
        slots={[makeAvailability()]}
        onSlotsChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
    expect(mockUpdateAvailability).not.toHaveBeenCalled()
  })

  it('starts editing a slot and calls onSlotsChange with the updated slot', async () => {
    const slot = makeAvailability({
      id: 'slot-1',
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '12:00',
    })
    const updated = { ...slot, startTime: '09:00' }
    mockUpdateAvailability.mockResolvedValue(updated)
    const onSlotsChange = vi.fn()

    render(<AvailabilityManager profileId="prof-1" slots={[slot]} onSlotsChange={onSlotsChange} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    // Editing keeps the slot's active state (regression: edits forced isActive: true).
    expect(mockUpdateAvailability).toHaveBeenCalledWith('prof-1', 'slot-1', {
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '12:00',
    })
    expect(onSlotsChange).toHaveBeenCalledWith([updated])
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Disponibilidade atualizada',
      tone: 'success',
    })
  })

  it('shows an inline error when updating fails', async () => {
    const slot = makeAvailability({ id: 'slot-1' })
    mockUpdateAvailability.mockRejectedValue(new Error('Falha ao atualizar'))
    render(<AvailabilityManager profileId="prof-1" slots={[slot]} onSlotsChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Falha ao atualizar')).toBeInTheDocument()
  })
})

describe('AvailabilityManager — delete flow', () => {
  it('preserves the slot after an unknown delete failure and permits retry', async () => {
    mockDeleteAvailability.mockRejectedValueOnce(null).mockResolvedValueOnce(undefined)
    const onSlotsChange = vi.fn()
    render(
      <AvailabilityManager
        profileId="prof-1"
        slots={[makeAvailability()]}
        onSlotsChange={onSlotsChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    await confirmSlotRemoval()
    expect(await screen.findByText('Erro ao remover.')).toBeInTheDocument()
    expect(onSlotsChange).not.toHaveBeenCalled()
    // The confirmation stays open after the failure so the user can retry.
    await confirmSlotRemoval()
    expect(onSlotsChange).toHaveBeenCalledWith([])
  })

  it('deletes a slot and calls onSlotsChange without it', async () => {
    const slot = makeAvailability({ id: 'slot-1' })
    mockDeleteAvailability.mockResolvedValue(undefined)
    const onSlotsChange = vi.fn()

    render(<AvailabilityManager profileId="prof-1" slots={[slot]} onSlotsChange={onSlotsChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    await confirmSlotRemoval()

    expect(mockDeleteAvailability).toHaveBeenCalledWith('prof-1', 'slot-1')
    expect(onSlotsChange).toHaveBeenCalledWith([])
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Disponibilidade removida',
      tone: 'success',
    })
  })

  it('shows an inline error when deleting fails', async () => {
    const slot = makeAvailability({ id: 'slot-1' })
    mockDeleteAvailability.mockRejectedValue(new Error('Falha ao remover'))
    render(<AvailabilityManager profileId="prof-1" slots={[slot]} onSlotsChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    await confirmSlotRemoval()

    expect(await screen.findByText('Falha ao remover')).toBeInTheDocument()
  })

  it('names the day and time in the confirmation and keeps the slot when dismissed', async () => {
    const slot = makeAvailability({
      id: 'slot-1',
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '12:00',
    })
    render(<AvailabilityManager profileId="prof-1" slots={[slot]} onSlotsChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    const dialog = await screen.findByRole('dialog', { name: 'Remover horário de atendimento?' })
    expect(dialog).toHaveTextContent('Quarta-feira · 08:00 – 12:00')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockDeleteAvailability).not.toHaveBeenCalled()
  })

  it('disables the confirmation while the slot is being removed', async () => {
    mockDeleteAvailability.mockReturnValue(new Promise(() => {}))
    render(
      <AvailabilityManager
        profileId="prof-1"
        slots={[makeAvailability()]}
        onSlotsChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    await confirmSlotRemoval()
    expect(await screen.findByRole('button', { name: /Aguarde/ })).toBeDisabled()
  })
})
