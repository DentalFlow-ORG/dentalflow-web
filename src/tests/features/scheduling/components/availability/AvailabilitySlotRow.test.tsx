import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@/features/scheduling/components/availability/AvailabilitySlotForm', () => ({
  AvailabilitySlotForm: ({ onSubmit }: { onSubmit: (dto: unknown) => void }) => (
    <button type="button" onClick={() => onSubmit({ dayOfWeek: 1 })}>
      slot-form
    </button>
  ),
}))

import { AvailabilitySlotRow } from '@/features/scheduling/components/availability/AvailabilitySlotRow'
import type { Availability } from '@/features/scheduling/types/scheduling.types'

function makeSlot(overrides: Partial<Availability> = {}): Availability {
  return {
    id: 'slot-1',
    profileId: 'profile-1',
    clinicId: 'clinic-1',
    dayOfWeek: 1,
    startTime: '1970-01-01T08:00:00.000Z',
    endTime: '1970-01-01T18:00:00.000Z',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const noop = vi.fn()

describe('AvailabilitySlotRow', () => {
  it('renders the day label, time range, and active status', () => {
    render(
      <AvailabilitySlotRow
        slot={makeSlot()}
        isEditing={false}
        isLoading={false}
        onEditStart={noop}
        onEditCancel={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument()
    expect(screen.getByText('08:00 – 18:00')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('shows "Inativo" for an inactive slot', () => {
    render(
      <AvailabilitySlotRow
        slot={makeSlot({ isActive: false })}
        isEditing={false}
        isLoading={false}
        onEditStart={noop}
        onEditCancel={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('calls onEditStart when the edit button is clicked', async () => {
    const onEditStart = vi.fn()
    render(
      <AvailabilitySlotRow
        slot={makeSlot()}
        isEditing={false}
        isLoading={false}
        onEditStart={onEditStart}
        onEditCancel={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Editar disponibilidade' }))
    expect(onEditStart).toHaveBeenCalledOnce()
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <AvailabilitySlotRow
        slot={makeSlot()}
        isEditing={false}
        isLoading={false}
        onEditStart={noop}
        onEditCancel={noop}
        onUpdate={noop}
        onDelete={onDelete}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover disponibilidade' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('disables the action buttons while loading', () => {
    render(
      <AvailabilitySlotRow
        slot={makeSlot()}
        isEditing={false}
        isLoading
        onEditStart={noop}
        onEditCancel={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'Editar disponibilidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remover disponibilidade' })).toBeDisabled()
  })

  it('renders the edit form instead when isEditing is true', async () => {
    const onUpdate = vi.fn()
    render(
      <AvailabilitySlotRow
        slot={makeSlot()}
        isEditing
        isLoading={false}
        onEditStart={noop}
        onEditCancel={noop}
        onUpdate={onUpdate}
        onDelete={noop}
      />,
    )
    expect(screen.queryByText('Editar disponibilidade')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'slot-form' }))
    expect(onUpdate).toHaveBeenCalledWith({ dayOfWeek: 1 })
  })
})
