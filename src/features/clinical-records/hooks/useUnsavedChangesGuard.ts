import { useCallback, useEffect } from 'react'
import { useBlocker } from '@tanstack/react-router'

// ── Constants ──────────────────────────────────────────────────────────────────

const MESSAGE =
  'Há alterações não salvas neste prontuário. Deseja sair mesmo assim?'

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  /** True when the record is DRAFT and the local draft has unsaved changes. */
  isDirty: boolean
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Warns before navigating away when there are unsaved clinical record changes.
 *
 * Two guards are wired:
 *   1. `beforeunload` — browser refresh, tab close, OS-level back button.
 *   2. TanStack Router `useBlocker` — SPA navigation within the app.
 *
 * Both are inactive when `isDirty` is false (empty draft, non-DRAFT status,
 * or after autosave/manual save has cleared the draft).
 */
export function useUnsavedChangesGuard({ isDirty }: Props): void {
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
  // shouldBlockFn is stable (useCallback with [] deps) so useBlocker's
  // internal effect does not re-register the history blocker on every render.
  // disabled: !isDirty removes the blocker entirely when there are no changes.
  const shouldBlockFn = useCallback(
    () => !window.confirm(MESSAGE),
    [],
  )

  useBlocker({
    shouldBlockFn,
    enableBeforeUnload: false, // handled explicitly by the useEffect above
    disabled: !isDirty,
  })
}
