// Module-level billing access state that bridges ProtectedAppRoute (child) with
// ThemeProvider (parent ancestor). ProtectedAppRoute writes here during its
// useLayoutEffect (children run before parents in React's commit phase), so by the
// time ThemeProvider reads it inside its own useLayoutEffect it already has the
// correct value. Subscribers allow ThemeProvider to react when billing access
// resolves mid-session (e.g. after Stripe checkout sync completes).

type Listener = () => void
const listeners = new Set<Listener>()
let _billingAccess: boolean | null = null

/**
 * Call from ProtectedAppRoute.useLayoutEffect with:
 * - `true`  when billing access is confirmed (active / trialing)
 * - `false` when confirmed to have no access
 * - `null`  when billing check is still in progress or component unmounts
 */
export function setBillingAccess(allowed: boolean | null): void {
  if (_billingAccess !== allowed) {
    _billingAccess = allowed
    for (const fn of listeners) fn()
  }
}

/** Returns the current billing access state. */
export function getBillingAccess(): boolean | null {
  return _billingAccess
}

/** Subscribe to billing access changes. Returns an unsubscribe function. */
export function subscribeBillingAccess(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
