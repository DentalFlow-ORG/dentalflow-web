import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { ClinicalRecord, UpdateClinicalRecordDto } from '../types/clinical-record.types'
import { isClinicalRecordEditable } from '../utils/clinical-record-status-rules'

// ── Types ──────────────────────────────────────────────────────────────────────

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

type Props = {
  draft: UpdateClinicalRecordDto
  setDraft: Dispatch<SetStateAction<UpdateClinicalRecordDto>>
  record: ClinicalRecord | null
  canAutosave: boolean
  saveQuiet: (dto: UpdateClinicalRecordDto) => Promise<void>
  debounceMs?: number
}

type Return = {
  autosaveStatus: AutosaveStatus
  /** API message of the last failed autosave (e.g. a validation error), if any. */
  autosaveError: string | null
  cancelPendingAutosave: () => void
  /** Resolves once an autosave request already in flight has settled. */
  waitForAutosaveInFlight: () => Promise<void>
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Wires debounced silent autosave for clinical record draft content.
 *
 * Draft clearing after a successful save uses object reference equality so that
 * a stale in-flight save never wipes newer local edits:
 *   setDraft(cur => cur === draftSnapshot ? {} : cur)
 *
 * `canAutosave` must be false for any non-DRAFT status — the caller is responsible
 * for passing the correct editability flag.
 */
export function useClinicalRecordAutosave({
  draft,
  setDraft,
  record,
  canAutosave,
  saveQuiet,
  debounceMs = 1500,
}: Props): Return {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle')
  const [autosaveError, setAutosaveError] = useState<string | null>(null)
  const inFlightRef = useRef<Promise<void> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Guard: nothing to save
    if (Object.keys(draft).length === 0) return
    // Guard: record is not in an editable state
    if (!canAutosave || !record || !isClinicalRecordEditable(record.status)) return

    // Capture reference at scheduling time.
    // After a successful save, we compare cur === draftSnapshot to decide
    // whether to clear draft — protects against stale saves wiping newer edits.
    const draftSnapshot = draft

    setAutosaveStatus('pending')
    if (timerRef.current) clearTimeout(timerRef.current)

    let isCurrent = true

    timerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving')
      const request = saveQuiet(draftSnapshot)
      const settled = request.then(
        () => undefined,
        () => undefined,
      )
      inFlightRef.current = settled
      void settled.finally(() => {
        if (inFlightRef.current === settled) inFlightRef.current = null
      })
      try {
        await request
        if (!isCurrent) return
        setAutosaveError(null)

        // Only clear the draft if the user has not typed again since this save
        // was scheduled — safe by object reference equality.
        setDraft((cur) => (cur === draftSnapshot ? {} : cur))
        setAutosaveStatus('saved')

        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => {
          // Clearing the saved draft invalidates this effect, but the indicator
          // still needs to expire. Preserve any newer pending/saving status.
          setAutosaveStatus((s) => (s === 'saved' ? 'idle' : s))
        }, 2500)
      } catch (err: unknown) {
        if (!isCurrent) return
        setAutosaveError(err instanceof Error && err.message ? err.message : null)
        setAutosaveStatus('error')
      }
    }, debounceMs)

    return () => {
      isCurrent = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [draft, canAutosave, record, saveQuiet, setDraft, debounceMs])

  // Cleanup both timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const cancelPendingAutosave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setAutosaveStatus('idle')
  }, [])

  const waitForAutosaveInFlight = useCallback(async () => {
    if (inFlightRef.current) await inFlightRef.current
  }, [])

  return { autosaveStatus, autosaveError, cancelPendingAutosave, waitForAutosaveInFlight }
}
