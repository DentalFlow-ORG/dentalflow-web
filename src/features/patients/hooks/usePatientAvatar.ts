import { useCallback, useEffect, useRef, useState } from 'react'

import { getPatientAvatar, upsertPatientAvatar } from '../services/patients.service'

type State = {
  key: string | null
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
/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
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

/**
 * Cache key. A patientId is used when the patient has one, because two people
 * may legitimately share an email address and must not share an avatar.
 * Otherwise the legacy identifier is used, matching how the row was stored.
 *
 * Every read and write of `avatarCache` must go through this, including the
 * synchronous first render: keying the initial state on the raw identifier let
 * one patient's cached photo appear under another patient who shares an email,
 * until the effect corrected it a moment later.
 */
export function patientAvatarCacheKey(
  identifier: string | null | undefined,
  patientId?: string | null,
): string | null {
  return patientId ?? identifier ?? null
}

function getInitialState(identifier: string | null | undefined, patientId?: string | null): State {
  const key = patientAvatarCacheKey(identifier, patientId)
  if (!key) return { key, avatarUrl: null, isLoading: false, isSaving: false }
  if (avatarCache.has(key)) {
    return { key, avatarUrl: avatarCache.get(key) ?? null, isLoading: false, isSaving: false }
  }
  return { key, avatarUrl: null, isLoading: true, isSaving: false }
}

export function usePatientAvatar(
  identifier: string | null | undefined,
  /**
   * Stable identity. Sent when the patient has one so that two people sharing
   * an email address keep separate avatars; `identifier` alone cannot tell
   * them apart.
   */
  patientId?: string | null,
) {
  const key = patientAvatarCacheKey(identifier, patientId)
  const scope = useRef({ key, version: 0 })
  if (scope.current.key !== key) scope.current = { key, version: scope.current.version + 1 }
  const [state, setState] = useState<State>(() => getInitialState(identifier, patientId))

  useEffect(() => {
    if (!identifier || !key) {
      setState({ key, avatarUrl: null, isLoading: false, isSaving: false })
      return
    }
    // Serve from cache when available — skip the network call entirely.
    if (avatarCache.has(key)) {
      setState({
        key,
        avatarUrl: avatarCache.get(key) ?? null,
        isLoading: false,
        isSaving: false,
      })
      return
    }
    let active = true
    setState({ key, avatarUrl: null, isLoading: true, isSaving: false })
    getPatientAvatar(identifier, patientId)
      .then((res) => {
        if (active) {
          avatarCache.set(key, res.avatarUrl)
          setState({ key, avatarUrl: res.avatarUrl, isLoading: false, isSaving: false })
        }
      })
      .catch(() => {
        // Not cached on failure so the next mount can retry.
        if (active) setState({ key, avatarUrl: null, isLoading: false, isSaving: false })
      })
    return () => {
      active = false
    }
  }, [identifier, patientId, key])

  const update = useCallback(
    async (avatarBase64: string | null) => {
      if (!identifier) return
      const operation = scope.current
      setState((s) => ({ ...s, isSaving: true }))
      try {
        await upsertPatientAvatar(identifier, avatarBase64, patientId)
        avatarCache.set(patientAvatarCacheKey(identifier, patientId) as string, avatarBase64)
        if (scope.current === operation)
          setState((s) => ({ ...s, avatarUrl: avatarBase64, isSaving: false }))
      } catch {
        if (scope.current === operation) setState((s) => ({ ...s, isSaving: false }))
        throw new Error('Não foi possível salvar a foto.')
      }
    },
    [identifier, patientId],
  )

  const visible = state.key === key ? state : getInitialState(identifier, patientId)
  return {
    avatarUrl: visible.avatarUrl,
    isLoading: visible.isLoading,
    isSaving: visible.isSaving,
    update,
  }
}
