import type { ClinicHealthRow } from '../types/admin.types'

export const TRIAL_ENDING_SOON_DAYS = 7
export const NO_RECENT_ACTIVITY_DAYS = 30

const PAYMENT_ISSUE_STATUSES = new Set(['PAST_DUE', 'UNPAID'])

export type ClinicHealthFlags = {
  paymentIssue: boolean
  trialEndingSoon: boolean
  noDentists: boolean
  noRecentAppointments: boolean
  noRecentActivity: boolean
  incompleteFiscalSetup: boolean
}

/** Days remaining until `trialEndsAt`, or null when there's no trial end date. Never negative. */
export function getTrialDaysRemaining(
  trialEndsAt: string | null | undefined,
  now: number = Date.now(),
): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - now
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

/** Computes the risk/support flags for a single clinic health row. Pure — no side effects. */
export function computeClinicHealthFlags(
  row: ClinicHealthRow,
  now: number = Date.now(),
): ClinicHealthFlags {
  const status = row.subscription?.status ?? null
  const trialDaysRemaining = getTrialDaysRemaining(row.subscription?.trialEndsAt, now)
  const lastActivityAt = row.lastActivity.timestamp
    ? new Date(row.lastActivity.timestamp).getTime()
    : null

  return {
    paymentIssue: status != null && PAYMENT_ISSUE_STATUSES.has(status),
    trialEndingSoon:
      status === 'TRIALING' &&
      trialDaysRemaining != null &&
      trialDaysRemaining <= TRIAL_ENDING_SOON_DAYS,
    noDentists: row.counts.dentists === 0,
    noRecentAppointments: row.counts.recentAppointments === 0,
    noRecentActivity:
      lastActivityAt == null || now - lastActivityAt > NO_RECENT_ACTIVITY_DAYS * 86_400_000,
    incompleteFiscalSetup: row.compliance?.fiscalSetupComplete !== true,
  }
}
