import { render, screen } from '@/test-utils/render-utils'

import {
  SchedulingKpiCards,
  computeKpiMetrics,
} from '@/features/scheduling/components/SchedulingKpiCards'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { DEFAULT_APPT_DATE } from '@/test-utils/factories/appointment.factory'

// Fix "today" to the factory default date so appointments hit the today filter
beforeEach(() => {
  vi.useFakeTimers()
  // 2026-05-26 at noon Brazil time (-03:00) = 15:00 UTC
  vi.setSystemTime(new Date('2026-05-26T15:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

// ── computeKpiMetrics (pure function) ─────────────────────────────────────────

describe('computeKpiMetrics', () => {
  it('returns all zeros when there are no appointments', () => {
    const m = computeKpiMetrics([])
    expect(m.todayTotal).toBe(0)
    expect(m.confirmed).toBe(0)
    expect(m.pending).toBe(0)
    expect(m.expectedRevenueCents).toBe(0)
  })

  it('counts only today\'s appointments in todayTotal', () => {
    const today = makeAppointment({ appointmentDate: DEFAULT_APPT_DATE })
    const other = makeAppointment({ appointmentDate: '2026-05-20' })
    expect(computeKpiMetrics([today, other]).todayTotal).toBe(1)
  })

  it('counts confirmed appointments scoped to today', () => {
    const confirmed = makeAppointment({ status: 'CONFIRMED' })
    const pending = makeAppointment({ status: 'PENDING' })
    const confirmedOtherDay = makeAppointment({
      status: 'CONFIRMED',
      appointmentDate: '2026-05-20',
    })
    const m = computeKpiMetrics([confirmed, pending, confirmedOtherDay])
    expect(m.confirmed).toBe(1)
    expect(m.pending).toBe(1)
  })

  it('excludes canceled appointments from expectedRevenueCents', () => {
    const active = makeAppointment({ estimatedAmountCents: 20000, status: 'PENDING' })
    const canceled = makeAppointment({ estimatedAmountCents: 10000, status: 'CANCELED' })
    expect(computeKpiMetrics([active, canceled]).expectedRevenueCents).toBe(20000)
  })

  it('sums estimatedAmountCents for non-canceled today appointments', () => {
    const a = makeAppointment({ estimatedAmountCents: 10000, status: 'CONFIRMED' })
    const b = makeAppointment({ estimatedAmountCents: 5000, status: 'PENDING' })
    expect(computeKpiMetrics([a, b]).expectedRevenueCents).toBe(15000)
  })

  it('treats null estimatedAmountCents as 0', () => {
    const a = makeAppointment({ estimatedAmountCents: null, status: 'CONFIRMED' })
    expect(computeKpiMetrics([a]).expectedRevenueCents).toBe(0)
  })
})

// ── SchedulingKpiCards (rendering) ───────────────────────────────────────────

describe('SchedulingKpiCards', () => {
  it('renders zero-state labels when appointments is empty', () => {
    render(<SchedulingKpiCards appointments={[]} />)
    expect(screen.getByText('Consultas hoje')).toBeInTheDocument()
    expect(screen.getByText('Confirmadas')).toBeInTheDocument()
    expect(screen.getByText('Pendentes')).toBeInTheDocument()
    expect(screen.getByText('Faturamento previsto')).toBeInTheDocument()
  })

  it('shows the correct today total', () => {
    const appts = [makeAppointment(), makeAppointment({ id: 'appt-2' })]
    render(<SchedulingKpiCards appointments={appts} />)
    // Scope to the "Consultas hoje" card to avoid ambiguity with pending count
    const label = screen.getByText('Consultas hoje')
    expect(label.parentElement).toHaveTextContent('2')
  })

  it('shows confirmed count', () => {
    const appts = [
      makeAppointment({ status: 'CONFIRMED' }),
      makeAppointment({ id: 'appt-2', status: 'PENDING' }),
    ]
    render(<SchedulingKpiCards appointments={appts} />)
    // Scope to the "Confirmadas" card to avoid matching the pending card's "1"
    const label = screen.getByText('Confirmadas')
    expect(label.parentElement).toHaveTextContent('1')
  })

  it('renders expected revenue in BRL format', () => {
    const appts = [makeAppointment({ estimatedAmountCents: 25000, status: 'PENDING' })]
    render(<SchedulingKpiCards appointments={appts} />)
    // R$ 250,00 in pt-BR format
    expect(screen.getByText(/250/)).toBeInTheDocument()
  })

  it('renders a large Faturamento previsto value without breaking', () => {
    const appts = [makeAppointment({ estimatedAmountCents: 1234567, status: 'PENDING' })]
    render(<SchedulingKpiCards appointments={appts} />)
    expect(screen.getByText(/12\.345/)).toBeInTheDocument()
    const label = screen.getByText('Faturamento previsto')
    const valueEl = label.nextElementSibling
    expect(valueEl).toHaveClass('text-base')
  })

  it('excludes non-today appointments from all KPIs', () => {
    const other = makeAppointment({ appointmentDate: '2026-01-01', status: 'CONFIRMED' })
    render(<SchedulingKpiCards appointments={[other]} />)
    // todayTotal should be 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
  })
})
