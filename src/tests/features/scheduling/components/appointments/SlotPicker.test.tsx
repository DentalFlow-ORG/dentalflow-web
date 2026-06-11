import { render, screen, userEvent } from '@/test-utils/render-utils'

import { SlotPicker } from '@/features/scheduling/components/appointments/SlotPicker'
import type { AvailabilitySlot } from '@/features/scheduling/types/scheduling.types'

function makeSlot(overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
  return { time: '10:00', available: true, reason: null, ...overrides }
}

const baseProps = {
  slots: [],
  value: '',
  onChange: vi.fn(),
  isLoading: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('SlotPicker — loading', () => {
  it('shows loading text when isLoading is true', () => {
    render(<SlotPicker {...baseProps} isLoading />)
    expect(screen.getByText(/Carregando horários/i)).toBeInTheDocument()
  })
})

// ── Empty state ───────────────────────────────────────────────────────────────

describe('SlotPicker — empty', () => {
  it('shows no-slots message when slots is empty and not loading', () => {
    render(<SlotPicker {...baseProps} slots={[]} />)
    expect(screen.getByText(/Nenhum horário disponível/i)).toBeInTheDocument()
  })
})

// ── Available slots ───────────────────────────────────────────────────────────

describe('SlotPicker — available slots', () => {
  it('renders available slot button with its time', () => {
    render(<SlotPicker {...baseProps} slots={[makeSlot({ time: '09:00' })]} />)
    expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument()
  })

  it('calls onChange with the slot time when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SlotPicker {...baseProps} slots={[makeSlot({ time: '10:00' })]} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '10:00' }))
    expect(onChange).toHaveBeenCalledWith('10:00')
  })
})

// ── Selected state ────────────────────────────────────────────────────────────

describe('SlotPicker — selected state', () => {
  it('marks the selected slot as pressed', () => {
    render(
      <SlotPicker
        {...baseProps}
        slots={[makeSlot({ time: '10:00' }), makeSlot({ time: '11:00' })]}
        value="10:00"
      />,
    )
    expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '11:00' })).toHaveAttribute('aria-pressed', 'false')
  })
})

// ── Unavailable slots ─────────────────────────────────────────────────────────

describe('SlotPicker — unavailable slots', () => {
  it('disables unavailable slot buttons', () => {
    render(<SlotPicker {...baseProps} slots={[makeSlot({ time: '10:00', available: false })]} />)
    expect(screen.getByText('10:00').closest('button')).toBeDisabled()
  })

  it('includes the unavailability reason in aria-label when reason is provided', () => {
    render(
      <SlotPicker
        {...baseProps}
        slots={[makeSlot({ time: '10:00', available: false, reason: 'Horário bloqueado' })]}
      />,
    )
    const btn = screen.getByText('10:00').closest('button')!
    expect(btn.getAttribute('aria-label')).toContain('Horário bloqueado')
    expect(btn.getAttribute('aria-label')).toContain('10:00')
  })

  it('does not add aria-label when unavailable slot has no reason', () => {
    render(
      <SlotPicker
        {...baseProps}
        slots={[makeSlot({ time: '10:00', available: false, reason: null })]}
      />,
    )
    // No explicit aria-label — falls back to text content
    const btn = screen.getByText('10:00').closest('button')!
    expect(btn.getAttribute('aria-label')).toBeNull()
  })
})
