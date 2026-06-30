import { useBlocker } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  /** True when the record is DRAFT and the local draft has unsaved changes. */
  isDirty: boolean
}

type Result = {
  /** True when a SPA navigation attempt has been intercepted and is pending. */
  isBlocked: boolean
  /** Allow the pending navigation to proceed. No-op when not blocked. */
  proceed: () => void
  /** Cancel the pending navigation and keep the user on the current page. No-op when not blocked. */
  reset: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const noop = () => undefined

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Warns before navigating away when there are unsaved clinical record changes.
 *
 * Two guards are wired:
 *   1. `beforeunload` — browser refresh, tab close, OS-level back button.
 *   2. TanStack Router `useBlocker` with `withResolver` — SPA navigation,
 *      resolved by the caller via the returned `proceed` / `reset` callbacks
 *      instead of `window.confirm`.
 *
 * Both are inactive when `isDirty` is false (empty draft, non-DRAFT status,
 * or after autosave/manual save has cleared the draft).
 *
 * Returns `{ isBlocked, proceed, reset }`. The caller is responsible for
 * rendering a confirmation UI when `isBlocked` is true.
 */
export function useUnsavedChangesGuard({ isDirty }: Props): Result {
  // ── Guard 1: browser-level navigation ──────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // required by older browsers for the dialog to appear
    }

    window.addEventListener('beforeunload', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [isDirty])

  // ── Guard 2: SPA navigation (route changes within the app) ─────────────────
  // shouldBlockFn always returns true — the disabled flag controls activation.
  // withResolver:true hands control back to the caller via proceed/reset so the
  // confirmation is rendered as a controlled Radix Dialog rather than a
  // window.confirm call, which is unreliable in iframe/sandbox contexts.
  const shouldBlockFn = useCallback(() => true, [])

  const resolver = useBlocker({
    shouldBlockFn,
    enableBeforeUnload: false, // handled explicitly by the useEffect above
    disabled: !isDirty,
    withResolver: true,
  })

  const isBlocked = resolver.status === 'blocked'

  return {
    isBlocked,
    proceed: isBlocked ? resolver.proceed : noop,
    reset: isBlocked ? resolver.reset : noop,
  }
}
