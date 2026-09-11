import { act, renderHook } from '@/test-utils/render-utils'
import { useState } from 'react'

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

  it('clears the saved indicator after saving a real stateful draft', async () => {
    const record = makeDraftRecord()
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => {
      const [draft, setDraft] = useState<UpdateClinicalRecordDto>({ diagnosis: 'Achado clínico' })
      return {
        draft,
        ...useClinicalRecordAutosave({
          draft,
          setDraft,
          record,
          canAutosave: true,
          saveQuiet,
          debounceMs: DEBOUNCE_MS,
        }),
      }
    })
    await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_MS))
    expect(saveQuiet).toHaveBeenCalledExactlyOnceWith({ diagnosis: 'Achado clínico' })
    expect(result.current.draft).toEqual({})
    expect(result.current.autosaveStatus).toBe('saved')
    await act(() => vi.advanceTimersByTimeAsync(2500))
    expect(result.current.autosaveStatus).toBe('idle')
  })

  it('does not erase a newer pending indicator when the previous saved timer expires', async () => {
    const record = makeDraftRecord()
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()
    const { result, rerender } = renderHook(
      ({ draft, debounceMs }) =>
        useClinicalRecordAutosave({
          draft,
          setDraft,
          record,
          canAutosave: true,
          saveQuiet,
          debounceMs,
        }),
      { initialProps: { draft: { diagnosis: 'v1' }, debounceMs: 1000 } },
    )
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(result.current.autosaveStatus).toBe('saved')
    rerender({ draft: { diagnosis: 'v2' }, debounceMs: 4000 })
    await act(() => vi.advanceTimersByTimeAsync(2500))
    expect(result.current.autosaveStatus).toBe('pending')
    await act(() => vi.advanceTimersByTimeAsync(1500))
    expect(result.current.autosaveStatus).toBe('saved')
    await act(() => vi.advanceTimersByTimeAsync(2500))
    expect(result.current.autosaveStatus).toBe('idle')
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores obsolete save %s after a newer draft is typed',
    async (outcome) => {
      const record = makeDraftRecord()
      const setDraft = vi.fn()
      let resolve!: () => void
      let reject!: (error: Error) => void
      const saveQuiet = vi
        .fn()
        .mockReturnValueOnce(
          new Promise<void>((done, fail) => {
            resolve = done
            reject = fail
          }),
        )
        .mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ draft }) =>
          useClinicalRecordAutosave({
            draft,
            setDraft,
            record,
            canAutosave: true,
            saveQuiet,
            debounceMs: DEBOUNCE_MS,
          }),
        { initialProps: { draft: { diagnosis: 'v1' } } },
      )
      await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_MS))
      rerender({ draft: { diagnosis: 'v2' } })
      await act(async () => {
        if (outcome === 'resolve') resolve()
        else reject(new Error('stale failure'))
      })
      expect(setDraft).not.toHaveBeenCalled()
      expect(result.current.autosaveStatus).toBe('pending')
      await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_MS))
      expect(saveQuiet).toHaveBeenLastCalledWith({ diagnosis: 'v2' })
      expect(result.current.autosaveStatus).toBe('saved')
    },
  )

  it('can cancel before any draft exists and after a save completes', async () => {
    const record = makeDraftRecord()
    const saveQuiet = vi.fn().mockResolvedValue(undefined)
    const setDraft = vi.fn()
    const { result, rerender } = renderHook(
      ({ draft }: { draft: UpdateClinicalRecordDto }) =>
        useClinicalRecordAutosave({
          draft,
          setDraft,
          record,
          canAutosave: true,
          saveQuiet,
          debounceMs: DEBOUNCE_MS,
        }),
      { initialProps: { draft: {} } },
    )
    act(() => result.current.cancelPendingAutosave())
    expect(saveQuiet).not.toHaveBeenCalled()
    rerender({ draft: { diagnosis: 'new finding' } })
    await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_MS))
    expect(result.current.autosaveStatus).toBe('saved')
    act(() => result.current.cancelPendingAutosave())
    await act(() => vi.advanceTimersByTimeAsync(3000))
    expect(result.current.autosaveStatus).toBe('idle')
    expect(saveQuiet).toHaveBeenCalledOnce()
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
