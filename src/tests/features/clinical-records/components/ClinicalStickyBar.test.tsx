import { render, screen, userEvent } from '@/test-utils/render-utils'

import { ClinicalStickyBar } from '@/features/clinical-records/components/ClinicalStickyBar'
import type { ClinicalRecord } from '@/features/clinical-records/types/clinical-record.types'

// ── Factory ───────────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'profile-1',
    patientName: 'Maria Silva',
    patientEmail: 'maria@example.com',
    patientPhone: null,
    status: 'DRAFT',
    chiefComplaint: null,
    anamnesis: null,
    clinicalEvolution: null,
    diagnosis: null,
    proceduresPerformed: null,
    treatmentPlan: null,
    prescription: null,
    recommendations: null,
    privateNotes: null,
    aiDraft: null,
    aiSummary: null,
    odontogramSnapshot: null,
    printedAt: null,
    completedAt: null,
    lockedAt: null,
    createdByUserId: 'user-1',
    updatedByUserId: null,
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
    profile: { id: 'profile-1', displayName: 'Maria Silva', userId: null },
    appointment: null,
    createdByUser: { id: 'user-1', firstName: 'Dr.', lastName: 'Santos' },
    updatedByUser: null,
    ...overrides,
  }
}

const noop = () => {}

// ── Patient identity ──────────────────────────────────────────────────────────

describe('ClinicalStickyBar — patient identity', () => {
  it.each([
    ['  ', '?'],
    [' Ana ', 'AN'],
  ])('handles patient name %j without broken initials', (patientName, initials) => {
    render(
      <ClinicalStickyBar
        record={makeRecord({ patientName })}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.getByText(initials)).toBeInTheDocument()
  })
  it('renders the patient name', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord()}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
  })

  it('renders avatar initials derived from the patient name', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord({ patientName: 'Ana Costa' })}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.getByText('AC')).toBeInTheDocument()
  })
})

// ── DRAFT quick actions ───────────────────────────────────────────────────────

describe('ClinicalStickyBar — DRAFT actions', () => {
  it('allows retry after an autosave error and blocks duplicate actions during saving', async () => {
    const onSaveDraft = vi.fn()
    const onComplete = vi.fn()
    const props = { record: makeRecord(), onSaveDraft, onComplete }
    const view = render(<ClinicalStickyBar {...props} isSaving={false} autosaveStatus="error" />)
    expect(screen.getByText('Erro ao salvar')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSaveDraft).toHaveBeenCalledOnce()
    view.rerender(<ClinicalStickyBar {...props} isSaving autosaveStatus="saving" />)
    await userEvent.click(screen.getByRole('button', { name: 'Salvando...' }))
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }))
    expect(onSaveDraft).toHaveBeenCalledOnce()
    expect(onComplete).not.toHaveBeenCalled()
    view.rerender(<ClinicalStickyBar {...props} isSaving={false} autosaveStatus="saved" />)
    expect(screen.queryByText('Erro ao salvar')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }))
    expect(onComplete).toHaveBeenCalledOnce()
    view.rerender(<ClinicalStickyBar {...props} isSaving={false} autosaveStatus="pending" />)
    expect(screen.queryByText('Salvando')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
  })
  it('renders the Concluir (Complete) button', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord({ status: 'DRAFT' })}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.getByRole('button', { name: /concluir/i })).toBeInTheDocument()
  })

  it('renders the Salvar (Save) button', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord({ status: 'DRAFT' })}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('disables both buttons while saving', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord({ status: 'DRAFT' })}
        isSaving={true}
        autosaveStatus="saving"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled()
    }
  })
})

// ── Non-DRAFT records ─────────────────────────────────────────────────────────

describe('ClinicalStickyBar — non-DRAFT records', () => {
  it.each(['COMPLETED', 'LOCKED', 'CANCELED'] as const)(
    'renders no action buttons for %s status',
    (status) => {
      render(
        <ClinicalStickyBar
          record={makeRecord({ status })}
          isSaving={false}
          autosaveStatus="idle"
          onSaveDraft={noop}
          onComplete={noop}
        />,
      )
      expect(screen.queryByRole('button')).toBeNull()
    },
  )
})

// ── Layout contract ───────────────────────────────────────────────────────────

describe('ClinicalStickyBar — layout contract', () => {
  it('does not render back navigation — back nav lives above the sticky bar', () => {
    render(
      <ClinicalStickyBar
        record={makeRecord()}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByText(/prontuários/i)).toBeNull()
    expect(screen.queryByText(/voltar/i)).toBeNull()
  })

  it('is in normal document flow — not sticky or fixed', () => {
    const { container } = render(
      <ClinicalStickyBar
        record={makeRecord()}
        isSaving={false}
        autosaveStatus="idle"
        onSaveDraft={noop}
        onComplete={noop}
      />,
    )
    const bar = container.firstElementChild
    // Must not use sticky/fixed positioning — that caused content overlap
    expect(bar).not.toHaveClass('sticky')
    expect(bar).not.toHaveClass('fixed')
    expect(bar).not.toHaveClass('absolute')
  })
})
