import { render, screen } from '@/test-utils/render-utils'

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
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled()
    })
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

  it('applies sticky positioning classes', () => {
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
    expect(bar).toHaveClass('sticky')
    expect(bar).toHaveClass('top-20')
  })
})
