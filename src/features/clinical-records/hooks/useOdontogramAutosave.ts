import { useCallback, useEffect, useRef, useState } from 'react'

import type { OdontogramData } from '../types/clinical-record.types'

type SaveOdontogram = (data: OdontogramData) => Promise<unknown>

type PendingSave = {
  data: OdontogramData
  // The save function is captured together with the data so a queued save
  // always writes to the patient that was active when the edit happened.
  save: SaveOdontogram
}

type Props = {
  onError: () => void
  debounceMs?: number
}

type TimerRef = { current: ReturnType<typeof setTimeout> | null }

function clearTimer(timerRef: TimerRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
}

/**
 * - `idle`: everything the user changed is persisted.
 * - `pending`: an edit is waiting for the debounce window.
 * - `saving`: a request is in flight.
 * - `error`: the last save failed; the newest edit is kept for `retry`.
 */
type OdontogramSaveState = 'idle' | 'pending' | 'saving' | 'error'

type Return = {
  scheduleSave: (data: OdontogramData, save: SaveOdontogram) => void
  flushSave: () => Promise<void>
  /** Re-sends the kept edit after a failure, without needing a new edit. */
  retry: () => Promise<void>
  saveState: OdontogramSaveState
  /** True while any edit is not yet persisted (pending, saving or failed). */
  isDirty: boolean
}

/**
 * Debounced, serialized persistence for the patient odontogram.
 *
 * - Rapid edits (typing tooth notes, toggling conditions) collapse into one
 *   request after `debounceMs` of inactivity.
 * - Only one request is in flight at a time; edits made meanwhile are queued
 *   and the latest one wins, so an older chart can never overwrite a newer one.
 * - A failed save stops the queue and keeps the newest edit (the failed one, or
 *   a newer edit made meanwhile). Nothing is retried automatically, so a broken
 *   connection cannot cause a request loop; `retry`, `flushSave`, a new edit or
 *   unmount sends it again.
 * - `flushSave` sends any pending edit immediately and resolves once every
 *   queued save has settled. Pending edits are also flushed on unmount.
 */
export function useOdontogramAutosave({ onError, debounceMs = 800 }: Props): Return {
  const pendingRef = useRef<PendingSave | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef<Promise<void> | null>(null)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const [saveState, setSaveState] = useState<OdontogramSaveState>('idle')

  const drain = useCallback((): Promise<void> => {
    if (inFlightRef.current) return inFlightRef.current

    const run = async () => {
      while (pendingRef.current) {
        const next = pendingRef.current
        pendingRef.current = null
        setSaveState('saving')
        try {
          await next.save(next.data)
        } catch {
          // Keep the newest edit: the failed one unless a newer one replaced it.
          if (!pendingRef.current) pendingRef.current = next
          setSaveState('error')
          onErrorRef.current()
          return
        }
      }
      // An edit scheduled while the last request was in flight waits for its
      // own debounce timer; otherwise everything is persisted.
      setSaveState(timerRef.current ? 'pending' : 'idle')
    }

    const promise = run().finally(() => {
      inFlightRef.current = null
    })
    inFlightRef.current = promise
    return promise
  }, [])

  const scheduleSave = useCallback(
    (data: OdontogramData, save: SaveOdontogram) => {
      pendingRef.current = { data, save }
      clearTimer(timerRef)
      setSaveState((current) => (current === 'saving' ? current : 'pending'))
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        void drain()
      }, debounceMs)
    },
    [debounceMs, drain],
  )

  const flushSave = useCallback(async () => {
    clearTimer(timerRef)
    // Wait for a save already in flight, then send whatever is still queued.
    if (inFlightRef.current) await inFlightRef.current
    if (pendingRef.current) await drain()
  }, [drain])

  useEffect(() => {
    return () => {
      clearTimer(timerRef)
      if (pendingRef.current) void drain()
    }
  }, [drain])

  return { scheduleSave, flushSave, retry: flushSave, saveState, isDirty: saveState !== 'idle' }
}
