import { useCallback, useEffect, useState } from 'react'

import { getPatientAvatar, upsertPatientAvatar } from '../services/patients.service'

type State = {
  avatarUrl: string | null
  isLoading: boolean
  isSaving: boolean
}

// Module-level cache keyed by patient identifier (email or name).
// Lives for the browser session — prevents duplicate GET /patients/avatar requests
// when the same patient appears in multiple views (detail panel → clinical record header).
// Failures are intentionally NOT cached so the next mount can retry.
const avatarCache = new Map<string, string | null>()

// For test isolation only — do not call from application code.
export function __resetAvatarCache(): void {
  avatarCache.clear()
}

// ── Public cache helpers ──────────────────────────────────────────────────────
// These allow callers (e.g. usePatientsPage) to pre-warm the cache with data
// they already have, so usePatientAvatar can serve hits without extra fetches.

/** Returns the cached avatarUrl, null if cached as absent, or undefined if not cached at all. */
export function getCachedPatientAvatar(identifier: string): string | null | undefined {
  if (!avatarCache.has(identifier)) return undefined
  return avatarCache.get(identifier) ?? null
}

/** Writes an avatar url (or null) into the session cache for the given identifier. */
export function setCachedPatientAvatar(identifier: string, avatarUrl: string | null): void {
  avatarCache.set(identifier, avatarUrl)
}

/**
 * Returns only the identifiers that are NOT already in the session cache.
 * Use this to avoid re-requesting data the cache already holds.
 */
export function getMissingPatientAvatarIdentifiers(identifiers: string[]): string[] {
  return identifiers.filter((id) => !avatarCache.has(id))
}

function getInitialState(identifier: string | null | undefined): State {
  if (!identifier) return { avatarUrl: null, isLoading: false, isSaving: false }
  if (avatarCache.has(identifier)) {
    return { avatarUrl: avatarCache.get(identifier) ?? null, isLoading: false, isSaving: false }
  }
  return { avatarUrl: null, isLoading: true, isSaving: false }
}

export function usePatientAvatar(identifier: string | null | undefined) {
  const [state, setState] = useState<State>(() => getInitialState(identifier))

  useEffect(() => {
    if (!identifier) {
      setState({ avatarUrl: null, isLoading: false, isSaving: false })
      return
    }
    // Serve from cache when available — skip the network call entirely.
    if (avatarCache.has(identifier)) {
      setState({ avatarUrl: avatarCache.get(identifier) ?? null, isLoading: false, isSaving: false })
      return
    }
    let active = true
    setState((s) => ({ ...s, isLoading: true }))
    getPatientAvatar(identifier)
      .then((res) => {
        if (active) {
          avatarCache.set(identifier, res.avatarUrl)
          setState({ avatarUrl: res.avatarUrl, isLoading: false, isSaving: false })
        }
      })
      .catch(() => {
        // Not cached on failure so the next mount can retry.
        if (active) setState({ avatarUrl: null, isLoading: false, isSaving: false })
      })
    return () => { active = false }
  }, [identifier])

  const update = useCallback(
    async (avatarBase64: string | null) => {
      if (!identifier) return
      setState((s) => ({ ...s, isSaving: true }))
      try {
        await upsertPatientAvatar(identifier, avatarBase64)
        avatarCache.set(identifier, avatarBase64)
        setState((s) => ({ ...s, avatarUrl: avatarBase64, isSaving: false }))
      } catch {
        setState((s) => ({ ...s, isSaving: false }))
        throw new Error('Não foi possível salvar a foto.')
      }
    },
    [identifier],
  )

  return { ...state, update }
}
