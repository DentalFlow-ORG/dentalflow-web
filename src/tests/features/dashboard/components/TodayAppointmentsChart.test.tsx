import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, within } from '@/test-utils/render-utils'

import { TodayAppointmentsChart } from '@/features/dashboard/components/TodayAppointmentsChart'
import type { ProductivitySummary } from '@/features/dashboard/types/productivity.types'

// Drive Recharts' public callbacks; actual pointer geometry and resizing remain browser QA.
vi.mock('recharts', async () => {
  const { createContext, useContext, useState, cloneElement } = await import('react')
  type Row = { label: string; count: number; color: string }
  const Context = createContext<{ row: Row | null; setRow: (row: Row | null) => void }>({
    row: null,
    setRow: () => {},
  })
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PieChart: ({ children }: { children: React.ReactNode }) => {
      const [row, setRow] = useState<Row | null>(null)
      return (
        <Context.Provider value={{ row, setRow }}>
          <div aria-label="Distribuição gráfica">{children}</div>
        </Context.Provider>
      )
    },
    Pie: ({
      data,
      activeIndex,
      onMouseEnter,
      onMouseLeave,
      activeShape,
    }: {
      data: Row[]
      activeIndex?: number
      onMouseEnter?: (row: Row, index: number) => void
      onMouseLeave?: () => void
      activeShape: (props: {
        cx: number
        cy: number
        innerRadius: number
        outerRadius: number
        startAngle: number
        endAngle: number
        fill: string
      }) => React.ReactNode
    }) => {
      const { setRow } = useContext(Context)
      return (
        <div>
          {data.map((row, index) => (
            <button
              key={row.label}
              type="button"
              aria-label={`Setor ${index + 1}`}
              aria-pressed={activeIndex === index}
              onMouseEnter={() => {
                setRow(row)
                onMouseEnter?.(row, index)
              }}
              onMouseLeave={() => {
                setRow(null)
                onMouseLeave?.()
              }}
            >
              Setor {index + 1}
            </button>
          ))}
          {activeIndex !== undefined &&
            activeShape({
              cx: 150,
              cy: 150,
              innerRadius: 94,
              outerRadius: 126,
              startAngle: 0,
              endAngle: 90,
              fill: data[activeIndex].color,
            })}
        </div>
      )
    },
    Cell: () => null,
    Sector: () => <span aria-label="Setor destacado" />,
    Tooltip: ({
      content,
    }: { content: React.ReactElement<{ active?: boolean; payload?: unknown[] }> }) => {
      const { row } = useContext(Context)
      return (
        <div role="tooltip">
          {cloneElement(content, {
            active: !!row,
            payload: row ? [{ payload: { ...row, fill: row.color } }] : [],
          })}
        </div>
      )
    },
  }
})

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
    expect(screen.getByRole('button', { name: 'Setor 1' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.unhover(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows singular and plural tooltip counts on chart hover and clears on leave', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    render(<TodayAppointmentsChart today={makeToday()} />)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeEmptyDOMElement()
    await userEvent.hover(screen.getByRole('button', { name: 'Setor 1' }))
    expect(within(tooltip).getByText('4 consultas')).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('40,0% do total')
    expect(screen.getByLabelText('Setor destacado')).toBeInTheDocument()
    await userEvent.unhover(screen.getByRole('button', { name: 'Setor 1' }))
    expect(tooltip).toBeEmptyDOMElement()
    expect(screen.queryByLabelText('Setor destacado')).not.toBeInTheDocument()
    await userEvent.hover(screen.getByRole('button', { name: 'Setor 4' }))
    expect(within(tooltip).getByText('1 consulta')).toBeInTheDocument()
  })

  it('retains touch legend selection after pointer leave and direct chart touch', async () => {
    render(
      <TodayAppointmentsChart
        today={makeToday({
          appointmentsTotal: 1,
          appointmentsConfirmed: 1,
          appointmentsPending: 0,
          appointmentsCompleted: 0,
          appointmentsCanceled: 0,
        })}
      />,
    )
    const legend = screen.getByRole('button', { name: /confirmadas/i })
    await userEvent.click(legend)
    await userEvent.unhover(legend)
    expect(legend).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Setor 1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    const graph = screen.getByLabelText('Distribuição gráfica')
    fireEvent.touchStart(graph)
    expect(legend).toHaveAttribute('aria-pressed', 'true')
    expect(fireEvent.mouseDown(graph)).toBe(false)
    await userEvent.click(legend)
    expect(legend).toHaveAttribute('aria-pressed', 'false')
  })
})
