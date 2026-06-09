import { renderWithProviders, screen } from '@/test-utils/render-utils'
import type { Lead } from '../types/leads.types'
import { LeadsTable } from './LeadsTable'

const baseLead: Lead = {
  id: '1',
  clinicId: 'clinic-1',
  name: 'Test Lead',
  email: null,
  phone: '11999990000',
  source: 'MANUAL',
  status: 'NEW',
  message: null,
  nextFollowUpAt: null,
  assignedToUserId: null,
  serviceId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  assignedTo: null,
  service: null,
}

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return { ...baseLead, ...overrides }
}

function renderTable(lead: Lead) {
  renderWithProviders(
    <LeadsTable
      leads={[lead]}
      total={1}
      isLoading={false}
      page={1}
      limit={30}
      onPageChange={vi.fn()}
      onView={vi.fn()}
      onEdit={vi.fn()}
      onArchive={vi.fn()}
    />,
  )
}

// Build today's local date string the same way todayIso() does
const _d = new Date()
const _localToday = [
  _d.getFullYear(),
  String(_d.getMonth() + 1).padStart(2, '0'),
  String(_d.getDate()).padStart(2, '0'),
].join('-')

const PAST = '2020-01-01T00:00:00.000Z'
const FUTURE = '2099-12-31T00:00:00.000Z'
const TODAY = `${_localToday}T12:00:00.000Z`

// ── Overdue highlight ─────────────────────────────────────────────────────────

describe('LeadsTable — overdue follow-up highlight', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows "Retorno atrasado" for NEW lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'NEW', nextFollowUpAt: PAST }))
    expect(screen.getAllByText(/Retorno atrasado/).length).toBeGreaterThan(0)
  })

  it('shows "Retorno atrasado" for CONTACTED lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'CONTACTED', nextFollowUpAt: PAST }))
    expect(screen.getAllByText(/Retorno atrasado/).length).toBeGreaterThan(0)
  })

  it('shows "Retorno atrasado" for SCHEDULED lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'SCHEDULED', nextFollowUpAt: PAST }))
    expect(screen.getAllByText(/Retorno atrasado/).length).toBeGreaterThan(0)
  })

  it('does not show overdue when nextFollowUpAt is null', () => {
    renderTable(makeLead({ status: 'NEW', nextFollowUpAt: null }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })

  it('does not show overdue when follow-up is today', () => {
    renderTable(makeLead({ status: 'NEW', nextFollowUpAt: TODAY }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })

  it('does not show overdue when follow-up is in the future', () => {
    renderTable(makeLead({ status: 'NEW', nextFollowUpAt: FUTURE }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })

  it('does not show overdue for CONVERTED lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'CONVERTED', nextFollowUpAt: PAST }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })

  it('does not show overdue for LOST lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'LOST', nextFollowUpAt: PAST }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })

  it('does not show overdue for ARCHIVED lead with past follow-up date', () => {
    renderTable(makeLead({ status: 'ARCHIVED', nextFollowUpAt: PAST }))
    expect(screen.queryByText(/Retorno atrasado/)).not.toBeInTheDocument()
  })
})
