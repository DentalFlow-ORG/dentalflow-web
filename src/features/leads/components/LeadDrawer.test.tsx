import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import type { MemberListItem } from '@/features/team/types/team.types'
import type { Lead, LeadActivity } from '../types/leads.types'
import { LeadDrawer } from './LeadDrawer'

const memberAna: MemberListItem = {
  id: 'u1',
  firstName: 'Ana',
  lastName: 'Silva',
  email: 'ana@example.com',
  role: 'ASSISTANT',
  phone: null,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  profile: null,
}

const baseLead: Lead = {
  id: '1',
  clinicId: 'clinic-1',
  name: 'Ana Silva',
  email: 'ana@example.com',
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

const sharedHandlers = {
  activities: [] as LeadActivity[],
  isLoadingActivities: false,
  isSaving: false,
  members: [] as MemberListItem[],
  isLoadingMembers: false,
  onClose: vi.fn(),
  onStatusChange: vi.fn().mockResolvedValue(undefined),
  onConvert: vi.fn().mockResolvedValue(undefined),
  onAddNote: vi.fn().mockResolvedValue(undefined),
  onAddContact: vi.fn().mockResolvedValue(undefined),
}

function renderCreate(overrides: Partial<Parameters<typeof LeadDrawer>[0]> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined)
  renderWithProviders(
    <LeadDrawer
      mode="create"
      lead={null}
      {...sharedHandlers}
      onSave={onSave}
      {...overrides}
    />,
  )
  return { onSave }
}

function renderEdit(lead: Lead, overrides: Partial<Parameters<typeof LeadDrawer>[0]> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined)
  renderWithProviders(
    <LeadDrawer
      mode="edit"
      lead={lead}
      {...sharedHandlers}
      onSave={onSave}
      {...overrides}
    />,
  )
  return { onSave }
}

// ── Label & input rendering ───────────────────────────────────────────────────

describe('LeadDrawer — "Data de retorno" field', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders "Data de retorno" label in create mode', () => {
    renderCreate()
    expect(screen.getByLabelText(/Data de retorno/i)).toBeInTheDocument()
  })

  it('prefills the date in edit mode from lead.nextFollowUpAt', () => {
    renderEdit({ ...baseLead, nextFollowUpAt: '2026-06-15T00:00:00.000Z' })
    expect(screen.getByLabelText(/Data de retorno/i)).toHaveValue('15/06/2026')
  })
})

// ── Clear button ──────────────────────────────────────────────────────────────

describe('LeadDrawer — clear button', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not show clear button when date is empty in create mode', () => {
    renderCreate()
    expect(screen.queryByRole('button', { name: /Limpar retorno/i })).not.toBeInTheDocument()
  })

  it('shows clear button when date is pre-filled in edit mode', () => {
    renderEdit({ ...baseLead, nextFollowUpAt: '2026-06-15T00:00:00.000Z' })
    expect(screen.getByRole('button', { name: /Limpar retorno/i })).toBeInTheDocument()
  })

  it('clicking clear button empties the input and hides the button', async () => {
    const user = userEvent.setup()
    renderEdit({ ...baseLead, nextFollowUpAt: '2026-06-15T00:00:00.000Z' })

    await user.click(screen.getByRole('button', { name: /Limpar retorno/i }))

    expect(screen.getByLabelText(/Data de retorno/i)).toHaveValue('')
    expect(screen.queryByRole('button', { name: /Limpar retorno/i })).not.toBeInTheDocument()
  })
})

// ── Save payload ──────────────────────────────────────────────────────────────

describe('LeadDrawer — save payload for nextFollowUpAt', () => {
  beforeEach(() => vi.clearAllMocks())

  it('save in create mode with blank date omits nextFollowUpAt (undefined)', async () => {
    const user = userEvent.setup()
    const { onSave } = renderCreate()

    await user.type(screen.getByLabelText(/Nome/i), 'Novo Lead')
    await user.click(screen.getByRole('button', { name: /Criar lead/i }))

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].nextFollowUpAt).toBeUndefined()
  })

  it('save in edit mode with cleared date sends nextFollowUpAt: null', async () => {
    const user = userEvent.setup()
    const { onSave } = renderEdit({ ...baseLead, nextFollowUpAt: '2026-06-15T00:00:00.000Z' })

    await user.click(screen.getByRole('button', { name: /Limpar retorno/i }))
    await user.click(screen.getByRole('button', { name: /^Salvar$/i }))

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].nextFollowUpAt).toBeNull()
  })
})

// ── Responsável field ─────────────────────────────────────────────────────────

describe('LeadDrawer — "Responsável" field', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the "Responsável" select in create mode', () => {
    renderCreate()
    expect(screen.getByRole('combobox', { name: /Responsável/i })).toBeInTheDocument()
  })

  it('preselects the assigned member name in edit mode', () => {
    renderEdit(
      { ...baseLead, assignedToUserId: 'u1', assignedTo: { id: 'u1', firstName: 'Ana', lastName: 'Silva' } },
      { members: [memberAna] },
    )
    expect(screen.getByRole('combobox', { name: /Responsável/i })).toHaveTextContent('Ana Silva')
  })

  it('save in create mode with no member sends assignedToUserId: undefined', async () => {
    const user = userEvent.setup()
    const { onSave } = renderCreate()

    await user.type(screen.getByLabelText(/Nome/i), 'Novo Lead')
    await user.click(screen.getByRole('button', { name: /Criar lead/i }))

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].assignedToUserId).toBeUndefined()
  })

  it('save in edit mode after clearing sends assignedToUserId: null', async () => {
    const user = userEvent.setup()
    const { onSave } = renderEdit(
      { ...baseLead, assignedToUserId: 'u1', assignedTo: { id: 'u1', firstName: 'Ana', lastName: 'Silva' } },
      { members: [memberAna] },
    )

    await user.click(screen.getByRole('combobox', { name: /Responsável/i }))
    await user.click(screen.getByRole('option', { name: /Sem responsável/i }))
    await user.click(screen.getByRole('button', { name: /^Salvar$/i }))

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].assignedToUserId).toBeNull()
  })

  it('save with selected member sends assignedToUserId: "u1"', async () => {
    const user = userEvent.setup()
    const { onSave } = renderCreate({ members: [memberAna] })

    await user.type(screen.getByLabelText(/Nome/i), 'Novo Lead')
    await user.click(screen.getByRole('combobox', { name: /Responsável/i }))
    await user.click(screen.getByRole('option', { name: /Ana Silva/i }))
    await user.click(screen.getByRole('button', { name: /Criar lead/i }))

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].assignedToUserId).toBe('u1')
  })
})
