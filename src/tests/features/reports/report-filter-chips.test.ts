import {
  getAppointmentsFilterChips,
  getFinanceFilterChips,
  getInventoryFilterChips,
  getInvoicesFilterChips,
} from '@/features/reports/utils/report-filter-chips'

const DEFAULTS = { startDate: '2026-05-07', endDate: '2026-06-06' }

// ── getFinanceFilterChips ─────────────────────────────────────────────────────

describe('getFinanceFilterChips', () => {
  it('returns empty array when all filters match defaults', () => {
    expect(
      getFinanceFilterChips({ startDate: '2026-05-07', endDate: '2026-06-06' }, DEFAULTS),
    ).toHaveLength(0)
  })

  it('returns empty array when filters are undefined', () => {
    expect(getFinanceFilterChips({}, DEFAULTS)).toHaveLength(0)
  })

  it('adds startDate chip when startDate differs from default', () => {
    const chips = getFinanceFilterChips(
      { startDate: '2026-01-01', endDate: '2026-06-06' },
      DEFAULTS,
    )
    expect(chips).toContainEqual({ key: 'startDate', label: 'Início: 01/01/2026' })
  })

  it('adds endDate chip when endDate differs from default', () => {
    const chips = getFinanceFilterChips(
      { startDate: '2026-05-07', endDate: '2026-04-01' },
      DEFAULTS,
    )
    expect(chips).toContainEqual({ key: 'endDate', label: 'Fim: 01/04/2026' })
  })

  it('does not add date chip when value matches default exactly', () => {
    const chips = getFinanceFilterChips(
      { startDate: '2026-05-07', endDate: '2026-06-06' },
      DEFAULTS,
    )
    expect(chips.some((c) => c.key === 'startDate')).toBe(false)
    expect(chips.some((c) => c.key === 'endDate')).toBe(false)
  })

  it('adds type chip for INCOME', () => {
    const chips = getFinanceFilterChips({ type: 'INCOME' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'type', label: 'Tipo: Entrada' })
  })

  it('adds type chip for EXPENSE', () => {
    const chips = getFinanceFilterChips({ type: 'EXPENSE' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'type', label: 'Tipo: Saída' })
  })

  it('adds status chip for PENDING', () => {
    const chips = getFinanceFilterChips({ status: 'PENDING' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Pendente' })
  })

  it('adds status chip for PAID', () => {
    const chips = getFinanceFilterChips({ status: 'PAID' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Pago' })
  })

  it('adds status chip for CANCELED', () => {
    const chips = getFinanceFilterChips({ status: 'CANCELED' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Cancelado' })
  })

  it('returns all active chips together', () => {
    const chips = getFinanceFilterChips(
      { startDate: '2026-05-07', endDate: '2026-06-06', type: 'INCOME', status: 'PAID' },
      DEFAULTS,
    )
    expect(chips).toHaveLength(2)
    expect(chips.some((c) => c.key === 'type')).toBe(true)
    expect(chips.some((c) => c.key === 'status')).toBe(true)
  })
})

// ── getAppointmentsFilterChips ────────────────────────────────────────────────

describe('getAppointmentsFilterChips', () => {
  it('returns empty array when all filters match defaults', () => {
    expect(
      getAppointmentsFilterChips({ startDate: '2026-05-07', endDate: '2026-06-06' }, DEFAULTS),
    ).toHaveLength(0)
  })

  it('adds startDate chip when changed', () => {
    const chips = getAppointmentsFilterChips({ startDate: '2026-03-01' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'startDate', label: 'Início: 01/03/2026' })
  })

  it('adds status chip for CONFIRMED', () => {
    const chips = getAppointmentsFilterChips({ status: 'CONFIRMED' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Confirmado' })
  })

  it('adds status chip for NO_SHOW', () => {
    const chips = getAppointmentsFilterChips({ status: 'NO_SHOW' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Não compareceu' })
  })
})

// ── getInventoryFilterChips ───────────────────────────────────────────────────

describe('getInventoryFilterChips', () => {
  it('returns empty array when status is undefined', () => {
    expect(getInventoryFilterChips({})).toHaveLength(0)
  })

  it('adds status chip for LOW', () => {
    const chips = getInventoryFilterChips({ status: 'LOW' })
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Baixo estoque' })
  })

  it('adds status chip for EXPIRED', () => {
    const chips = getInventoryFilterChips({ status: 'EXPIRED' })
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Vencido' })
  })

  it('adds status chip for EXPIRING', () => {
    const chips = getInventoryFilterChips({ status: 'EXPIRING' })
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Vencendo' })
  })
})

// ── getInvoicesFilterChips ────────────────────────────────────────────────────

describe('getInvoicesFilterChips', () => {
  it('returns empty array when all filters match defaults', () => {
    expect(
      getInvoicesFilterChips({ startDate: '2026-05-07', endDate: '2026-06-06' }, DEFAULTS),
    ).toHaveLength(0)
  })

  it('uses "Competência inicial" label for startDate', () => {
    const chips = getInvoicesFilterChips({ startDate: '2026-02-01' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'startDate', label: 'Competência inicial: 01/02/2026' })
  })

  it('uses "Competência final" label for endDate', () => {
    const chips = getInvoicesFilterChips({ endDate: '2026-03-31' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'endDate', label: 'Competência final: 31/03/2026' })
  })

  it('adds status chip for ISSUED', () => {
    const chips = getInvoicesFilterChips({ status: 'ISSUED' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Emitida' })
  })

  it('adds status chip for READY_TO_ISSUE', () => {
    const chips = getInvoicesFilterChips({ status: 'READY_TO_ISSUE' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: Pronta para emissão' })
  })
})

// ── Unmapped status values ────────────────────────────────────────────────────
//
// The appointment, inventory and invoice filters type `status` as a plain
// string, so a status the label maps do not know about still has to produce a
// readable chip instead of "Status: undefined".

describe('unmapped status values', () => {
  it('falls back to the raw appointment status', () => {
    const chips = getAppointmentsFilterChips({ status: 'RESCHEDULED' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: RESCHEDULED' })
  })

  it('falls back to the raw inventory status', () => {
    const chips = getInventoryFilterChips({ status: 'DISCONTINUED' })
    expect(chips).toContainEqual({ key: 'status', label: 'Status: DISCONTINUED' })
  })

  it('falls back to the raw invoice status', () => {
    const chips = getInvoicesFilterChips({ status: 'REJECTED' }, DEFAULTS)
    expect(chips).toContainEqual({ key: 'status', label: 'Status: REJECTED' })
  })
})
