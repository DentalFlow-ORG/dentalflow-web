import { type ReactNode } from 'react'

import type { AuthUserRole } from '@/features/auth/types'

type Props = {
  children: ReactNode
  role?: AuthUserRole
}

// Billing access check was moved to ProtectedAppRoute so the shell decision
// (AppShell vs SubscriptionOnlyShell) is made before any navigation renders.
export function SubscriptionRequiredGate({ children }: Props) {
  return <>{children}</>
}
