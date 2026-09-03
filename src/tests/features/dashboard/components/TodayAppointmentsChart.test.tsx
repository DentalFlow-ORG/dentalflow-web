import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { TodayAppointmentsChart } from '@/features/dashboard/components/TodayAppointmentsChart'
import type { ProductivitySummary } from '@/features/dashboard/types/productivity.types'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

let mockThemeMode: 'light' | 'dark' = 'light'
vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: mockThemeMode, setTheme: vi.fn() }),
}))

function makeToday(
  overrides: Partial<ProductivitySummary['today']> = {},
): ProductivitySummary['today'] {
  return {
    date: '2026-06-01',
    appointmentsTotal: 10,
    appointmentsConfirmed: 4,
    appointmentsPending: 3,
    appointmentsCompleted: 2,
    appointmentsCanceledOrNoShow: 1,
    appointmentsCanceled: 1,
    appointmentsNoShow: 0,
    pendingPaymentsCount: 0,
    pendingPaymentsAmountCents: 0,
    ...overrides,
  }
}

describe('TodayAppointmentsChart', () => {
  beforeEach(() => {
    mockThemeMode = 'light'
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
  })

  it('shows an empty state when there are no appointments today', () => {
    render(<TodayAppointmentsChart today={makeToday({ appointmentsTotal: 0 })} />)
    expect(screen.getByText('Nenhuma consulta para hoje.')).toBeInTheDocument()
  })

  it('does not render the legend in the empty state', () => {
    render(<TodayAppointmentsChart today={makeToday({ appointmentsTotal: 0 })} />)
    expect(screen.queryByText('Confirmadas')).not.toBeInTheDocument()
  })

  it('renders the total count and legend rows with counts and percentages', () => {
    render(<TodayAppointmentsChart today={makeToday()} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /confirmadas: 4 consultas, 40,0% do total/i }),
    ).toBeInTheDocument()
  })

  it('shows an em dash and disables the button for a zero-count status', () => {
    render(<TodayAppointmentsChart today={makeToday({ appointmentsNoShow: 0 })} />)
    const button = screen.getByRole('button', {
      name: /não compareceu: 0 consultas, 0% do total/i,
    })
    expect(button).toBeDisabled()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('links to the agenda page', () => {
    render(<TodayAppointmentsChart today={makeToday()} />)
    expect(screen.getByRole('link', { name: 'Ver agenda' })).toHaveAttribute(
      'href',
      '/app/agendamentos',
    )
  })

  it('toggles selection on click for an active legend row', async () => {
    render(<TodayAppointmentsChart today={makeToday()} />)
    const button = screen.getByRole('button', { name: /confirmadas/i })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('does nothing when clicking a disabled (zero-count) legend row', async () => {
    render(<TodayAppointmentsChart today={makeToday({ appointmentsNoShow: 0 })} />)
    const button = screen.getByRole('button', { name: /não compareceu/i })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders correctly in dark theme', () => {
    mockThemeMode = 'dark'
    render(<TodayAppointmentsChart today={makeToday()} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('highlights on hover for a hover-capable device and clears on mouse leave', async () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    render(<TodayAppointmentsChart today={makeToday()} />)
    const button = screen.getByRole('button', { name: /confirmadas/i })
    await userEvent.hover(button)
    await userEvent.unhover(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
