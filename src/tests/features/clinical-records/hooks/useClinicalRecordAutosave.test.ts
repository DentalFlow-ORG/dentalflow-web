import { act, renderHook } from '@/test-utils/render-utils'

import { useClinicalRecordAutosave } from '@/features/clinical-records/hooks/useClinicalRecordAutosave'
import type {
  ClinicalRecord,
  UpdateClinicalRecordDto,
} from '@/features/clinical-records/types/clinical-record.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeDraftRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'prof-1',
    patientName: 'Test Patient',
    patientEmail: null,
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
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    profile: { id: 'prof-1', displayName: 'Dr. Test', userId: 'user-1' },
    appointment: null,
    createdByUser: { id: 'user-1', firstName: 'Test', lastName: 'User' },
    updatedByUser: null,
    ...overrides,
  }
}

const DEBOUNCE_MS = 1000

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useClinicalRecordAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // T1 ─────────────────────────────────────────────────────────────────────────

  it('does not call saveQuiet when draft is empty', async () => {
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()

    renderHook(() =>
      useClinicalRecordAutosave({
        draft: {},
        setDraft,
        record: makeDraftRecord(),
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 500)
    })

    expect(saveQuiet).not.toHaveBeenCalled()
  })

  // T2 ─────────────────────────────────────────────────────────────────────────

  it('does not call saveQuiet when canAutosave is false', async () => {
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()

    renderHook(() =>
      useClinicalRecordAutosave({
        draft: { clinicalEvolution: 'some text' },
        setDraft,
        record: makeDraftRecord({ status: 'COMPLETED' }),
        canAutosave: false,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 500)
    })

    expect(saveQuiet).not.toHaveBeenCalled()
  })

  // T3 ─────────────────────────────────────────────────────────────────────────

  it('calls saveQuiet with the draft after debounce when record is editable', async () => {
    const draft: UpdateClinicalRecordDto = { clinicalEvolution: 'notes' }
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()

    renderHook(() =>
      useClinicalRecordAutosave({
        draft,
        setDraft,
        record: makeDraftRecord(),
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    // Not yet
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1)
    })
    expect(saveQuiet).not.toHaveBeenCalled()

    // Now — crosses the debounce threshold
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(saveQuiet).toHaveBeenCalledOnce()
    expect(saveQuiet).toHaveBeenCalledWith(draft)
  })

  // T4 ─────────────────────────────────────────────────────────────────────────

  it('sets saved then idle after a successful autosave', async () => {
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()
    // Both draft and record must be stable object references across re-renders.
    // Object literals created inside renderHook's callback get a new reference
    // every render, causing the effect's deps to change and the timer to reset.
    const draft: UpdateClinicalRecordDto = { anamnesis: 'text' }
    const record = makeDraftRecord()

    const { result } = renderHook(() =>
      useClinicalRecordAutosave({
        draft,
        setDraft,
        record,
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    // Advance through debounce; saveQuiet resolves immediately
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100)
    })

    expect(saveQuiet).toHaveBeenCalledOnce()
    expect(result.current.autosaveStatus).toBe('saved')

    // After 2500ms the indicator resets to idle
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500)
    })
    expect(result.current.autosaveStatus).toBe('idle')
  })

  // T5 ─────────────────────────────────────────────────────────────────────────

  it('setDraft functional updater preserves newer draft edits (stale reference check)', async () => {
    const refA: UpdateClinicalRecordDto = { clinicalEvolution: 'v1' }
    const refB: UpdateClinicalRecordDto = { clinicalEvolution: 'v2' }
    const setDraft = vi.fn()
    const saveQuiet = vi.fn().mockResolvedValue(undefined)

    renderHook(() =>
      useClinicalRecordAutosave({
        draft: refA,
        setDraft,
        record: makeDraftRecord(),
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    // Fire save
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100)
    })

    // The hook calls setDraft with a functional updater
    expect(setDraft).toHaveBeenCalledWith(expect.any(Function))

    const updater = setDraft.mock.calls[setDraft.mock.calls.length - 1][0] as (
      cur: UpdateClinicalRecordDto,
    ) => UpdateClinicalRecordDto

    // Current draft unchanged → clear to {} (save is for this version)
    expect(updater(refA)).toEqual({})

    // Current draft is a newer edit (different reference) → preserve
    expect(updater(refB)).toBe(refB)
  })

  // T6 ─────────────────────────────────────────────────────────────────────────

  it('sets error status and does not clear draft when saveQuiet throws', async () => {
    const draft: UpdateClinicalRecordDto = { diagnosis: 'important finding' }
    const setDraft = vi.fn()
    const saveQuiet = vi.fn().mockRejectedValue(new Error('network error'))
    const record = makeDraftRecord()

    const { result } = renderHook(() =>
      useClinicalRecordAutosave({
        draft,
        setDraft,
        record,
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 100)
    })

    expect(result.current.autosaveStatus).toBe('error')
    // Draft must not be cleared — setDraft should not have been called
    expect(setDraft).not.toHaveBeenCalled()
  })

  // T7 ─────────────────────────────────────────────────────────────────────────

  it('cancelPendingAutosave cancels the timer and resets status to idle', async () => {
    const draft: UpdateClinicalRecordDto = { prescription: 'amox 500mg' }
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()
    const record = makeDraftRecord()

    const { result } = renderHook(() =>
      useClinicalRecordAutosave({
        draft,
        setDraft,
        record,
        canAutosave: true,
        saveQuiet,
        debounceMs: DEBOUNCE_MS,
      }),
    )

    // Timer is running but has not fired
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 100)
    })
    expect(result.current.autosaveStatus).toBe('pending')

    // Cancel
    act(() => {
      result.current.cancelPendingAutosave()
    })
    expect(result.current.autosaveStatus).toBe('idle')

    // Advancing past original threshold does not trigger a save
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 500)
    })
    expect(saveQuiet).not.toHaveBeenCalled()
  })
})
