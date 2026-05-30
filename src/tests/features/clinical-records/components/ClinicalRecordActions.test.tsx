import type { ReactNode } from 'react'
import { within } from '@testing-library/react'
import { renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'

import { ClinicalRecordActions } from '@/features/clinical-records/components/ClinicalRecordActions'
import type { ClinicalRecord, ClinicalRecordStatus } from '@/features/clinical-records/types/clinical-record.types'

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Avoid Radix UI Portal issues in jsdom by rendering an inline dialog substitute.
// This mock renders the title, description, confirm button, and optional cancel
// button directly in the DOM so tests can assert on text and click handlers.
vi.mock('@/components/common/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    title?: string
    description?: ReactNode
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    subject?: string
    tone?: string
    isConfirming?: boolean
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {description && <p>{String(description)}</p>}
        <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        {cancelLabel && <button type="button" onClick={onCancel}>{cancelLabel}</button>}
      </div>
    ) : null,
}))

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeRecord(status: ClinicalRecordStatus = 'DRAFT'): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'prof-1',
    patientName: 'João Silva',
    patientEmail: null,
    patientPhone: null,
    status,
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
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    profile: { id: 'prof-1', displayName: 'Dr. Test', userId: 'user-1' },
    appointment: null,
    createdByUser: { id: 'user-1', firstName: 'Test', lastName: 'User' },
    updatedByUser: null,
  }
}

type Props = Parameters<typeof ClinicalRecordActions>[0]

function makeProps(
  status: ClinicalRecordStatus = 'DRAFT',
  overrides: Partial<Props> = {},
): Props {
  return {
    record: makeRecord(status),
    isSaving: false,
    onSaveDraft: vi.fn(),
    onComplete: vi.fn(),
    onLock: vi.fn(),
    onCancel: vi.fn(),
    onRestore: vi.fn(),
    onPrint: vi.fn(),
    ...overrides,
  }
}

function render(props: Props) {
  return renderWithProviders(<ClinicalRecordActions {...props} />)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

// ── DRAFT status ──────────────────────────────────────────────────────────────

describe('ClinicalRecordActions — DRAFT status', () => {
  it('renders "Salvar agora" and "Concluir atendimento" actions', () => {
    render(makeProps('DRAFT'))
    expect(screen.getByRole('button', { name: /Salvar agora/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Concluir atendimento/i })).toBeInTheDocument()
  })

  it('renders print action', () => {
    render(makeProps('DRAFT'))
    expect(screen.getByRole('button', { name: /Imprimir prontuário/i })).toBeInTheDocument()
  })

  it('clicking "Salvar agora" calls onSaveDraft', async () => {
    const user = userEvent.setup()
    const props = makeProps('DRAFT')
    render(props)
    await user.click(screen.getByRole('button', { name: /Salvar agora/i }))
    expect(props.onSaveDraft).toHaveBeenCalledOnce()
  })

  it('clicking "Concluir atendimento" calls onComplete', async () => {
    const user = userEvent.setup()
    const props = makeProps('DRAFT')
    render(props)
    await user.click(screen.getByRole('button', { name: /Concluir atendimento/i }))
    expect(props.onComplete).toHaveBeenCalledOnce()
  })
})

// ── COMPLETED status ──────────────────────────────────────────────────────────

describe('ClinicalRecordActions — COMPLETED status', () => {
  it('renders lock and cancel actions', () => {
    render(makeProps('COMPLETED'))
    expect(screen.getByRole('button', { name: /Bloquear prontuário/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar prontuário/i })).toBeInTheDocument()
  })

  it('does not render save or complete actions', () => {
    render(makeProps('COMPLETED'))
    expect(screen.queryByRole('button', { name: /Salvar agora/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Concluir atendimento/i })).not.toBeInTheDocument()
  })

  it('clicking "Bloquear prontuário" opens lock confirmation dialog', async () => {
    const user = userEvent.setup()
    render(makeProps('COMPLETED'))
    await user.click(screen.getByRole('button', { name: /Bloquear prontuário/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('confirming lock dialog calls onLock', async () => {
    const user = userEvent.setup()
    const props = makeProps('COMPLETED')
    render(props)
    await user.click(screen.getByRole('button', { name: /Bloquear prontuário/i }))
    await user.click(screen.getByRole('button', { name: 'Bloquear definitivamente' }))
    expect(props.onLock).toHaveBeenCalledOnce()
  })

  it('dismissing lock dialog with "Cancelar" does not call onLock', async () => {
    const user = userEvent.setup()
    const props = makeProps('COMPLETED')
    render(props)
    await user.click(screen.getByRole('button', { name: /Bloquear prontuário/i }))
    // "Cancelar" exactly — distinct from "Cancelar prontuário" action button
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(props.onLock).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ── Lock dialog safety ─────────────────────────────────────────────────────────
// LOCKED is the only status with no restore path. These tests protect the UX copy
// that communicates the irreversibility of the action.

describe('ClinicalRecordActions — lock dialog safety', () => {
  it('lock dialog communicates that the action is permanent and cannot be undone', async () => {
    const user = userEvent.setup()
    render(makeProps('COMPLETED'))
    await user.click(screen.getByRole('button', { name: /Bloquear prontuário/i }))
    expect(screen.getByText(/permanente/i)).toBeInTheDocument()
    expect(screen.getByText(/não pode ser desfeita/i)).toBeInTheDocument()
  })

  it('lock dialog confirm button uses the explicit label "Bloquear definitivamente"', async () => {
    const user = userEvent.setup()
    render(makeProps('COMPLETED'))
    await user.click(screen.getByRole('button', { name: /Bloquear prontuário/i }))
    // Exact label — must not be simplified to something ambiguous
    expect(screen.getByRole('button', { name: 'Bloquear definitivamente' })).toBeInTheDocument()
  })
})

// ── Cancel dialog ──────────────────────────────────────────────────────────────

describe('ClinicalRecordActions — cancel dialog', () => {
  it('clicking "Cancelar prontuário" opens cancel confirmation dialog', async () => {
    const user = userEvent.setup()
    render(makeProps('DRAFT'))
    await user.click(screen.getByRole('button', { name: /Cancelar prontuário/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('cancel dialog confirm label is "Confirmar cancelamento"', async () => {
    const user = userEvent.setup()
    render(makeProps('DRAFT'))
    await user.click(screen.getByRole('button', { name: /Cancelar prontuário/i }))
    expect(screen.getByRole('button', { name: 'Confirmar cancelamento' })).toBeInTheDocument()
  })

  it('confirming cancel dialog calls onCancel', async () => {
    const user = userEvent.setup()
    const props = makeProps('DRAFT')
    render(props)
    await user.click(screen.getByRole('button', { name: /Cancelar prontuário/i }))
    await user.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))
    expect(props.onCancel).toHaveBeenCalledOnce()
  })

  it('dismissing cancel dialog with "Manter prontuário" does not call onCancel', async () => {
    const user = userEvent.setup()
    const props = makeProps('DRAFT')
    render(props)
    await user.click(screen.getByRole('button', { name: /Cancelar prontuário/i }))
    await user.click(screen.getByRole('button', { name: 'Manter prontuário' }))
    expect(props.onCancel).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ── CANCELED status ────────────────────────────────────────────────────────────

describe('ClinicalRecordActions — CANCELED status', () => {
  it('renders restore action', () => {
    render(makeProps('CANCELED'))
    expect(screen.getByRole('button', { name: /Restaurar prontuário/i })).toBeInTheDocument()
  })

  it('does not render save, complete, lock, or cancel actions', () => {
    render(makeProps('CANCELED'))
    expect(screen.queryByRole('button', { name: /Salvar agora/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Concluir atendimento/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Bloquear prontuário/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar prontuário/i })).not.toBeInTheDocument()
  })

  it('clicking restore opens restore confirmation dialog', async () => {
    const user = userEvent.setup()
    render(makeProps('CANCELED'))
    await user.click(screen.getByRole('button', { name: /Restaurar prontuário/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('confirming restore dialog calls onRestore', async () => {
    const user = userEvent.setup()
    const props = makeProps('CANCELED')
    render(props)
    // Click the trigger button
    await user.click(screen.getByRole('button', { name: /Restaurar prontuário/i }))
    // The dialog also has a "Restaurar prontuário" confirm button — use within() to target it
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /Restaurar prontuário/i }))
    expect(props.onRestore).toHaveBeenCalledOnce()
  })

  it('dismissing restore dialog with "Fechar" does not call onRestore', async () => {
    const user = userEvent.setup()
    const props = makeProps('CANCELED')
    render(props)
    await user.click(screen.getByRole('button', { name: /Restaurar prontuário/i }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(props.onRestore).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ── LOCKED status ──────────────────────────────────────────────────────────────

describe('ClinicalRecordActions — LOCKED status', () => {
  it('renders only the print action', () => {
    render(makeProps('LOCKED'))
    expect(screen.getByRole('button', { name: /Imprimir prontuário/i })).toBeInTheDocument()
  })

  it('does not render save, complete, lock, cancel, or restore actions', () => {
    render(makeProps('LOCKED'))
    expect(screen.queryByRole('button', { name: /Salvar agora/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Concluir atendimento/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Bloquear prontuário/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar prontuário/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Restaurar prontuário/i })).not.toBeInTheDocument()
  })
})

// ── Print ──────────────────────────────────────────────────────────────────────

describe('ClinicalRecordActions — print', () => {
  it.each(['DRAFT', 'COMPLETED', 'LOCKED', 'CANCELED'] as const)(
    'clicking print calls onPrint when status is %s',
    async (status) => {
      const user = userEvent.setup()
      const props = makeProps(status)
      render(props)
      await user.click(screen.getByRole('button', { name: /Imprimir prontuário/i }))
      expect(props.onPrint).toHaveBeenCalledOnce()
    },
  )
})

// ── isSaving / disabled behavior ───────────────────────────────────────────────

describe('ClinicalRecordActions — isSaving', () => {
  it('shows "Salvando..." on save button when isSaving=true', () => {
    render(makeProps('DRAFT', { isSaving: true }))
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('save button is disabled when isSaving=true', () => {
    render(makeProps('DRAFT', { isSaving: true }))
    expect(screen.getByRole('button', { name: /Salvando\.\.\./i })).toBeDisabled()
  })

  it('complete button is disabled when isSaving=true', () => {
    render(makeProps('DRAFT', { isSaving: true }))
    expect(screen.getByRole('button', { name: /Concluir atendimento/i })).toBeDisabled()
  })

  it('lock button is disabled when isSaving=true', () => {
    render(makeProps('COMPLETED', { isSaving: true }))
    expect(screen.getByRole('button', { name: /Bloquear prontuário/i })).toBeDisabled()
  })

  it('cancel button is disabled when isSaving=true', () => {
    render(makeProps('DRAFT', { isSaving: true }))
    expect(screen.getByRole('button', { name: /Cancelar prontuário/i })).toBeDisabled()
  })

  it('print button is NOT disabled when isSaving=true', () => {
    render(makeProps('DRAFT', { isSaving: true }))
    expect(screen.getByRole('button', { name: /Imprimir prontuário/i })).not.toBeDisabled()
  })
})
