import type { ClinicHealthRow } from '@/features/admin/types/admin.types'
import {
  computeClinicHealthFlags,
  getTrialDaysRemaining,
} from '@/features/admin/utils/clinic-health'

const NOW = new Date('2026-06-30T12:00:00.000Z').getTime()

function makeRow(overrides: Partial<ClinicHealthRow> = {}): ClinicHealthRow {
  return {
    clinic: { id: 'clinic-1', name: 'Clínica A', isActive: true },
    subscription: null,
    counts: { dentists: 1, activeUsers: 1, totalAppointments: 10, recentAppointments: 3 },
    lastActivity: { timestamp: '2026-06-29T12:00:00.000Z', source: 'USER_LOGIN' },
    compliance: { fiscalSetupComplete: true },
    ...overrides,
  }
}

describe('getTrialDaysRemaining', () => {
  it('returns null when trialEndsAt is missing', () => {
    expect(getTrialDaysRemaining(null, NOW)).toBeNull()
    expect(getTrialDaysRemaining(undefined, NOW)).toBeNull()
  })

  it('returns the number of whole days remaining, rounded up', () => {
    const trialEndsAt = new Date(NOW + 5.2 * 86_400_000).toISOString()
    expect(getTrialDaysRemaining(trialEndsAt, NOW)).toBe(6)
  })

  it('clamps to zero for a trial end date in the past', () => {
    const trialEndsAt = new Date(NOW - 86_400_000).toISOString()
    expect(getTrialDaysRemaining(trialEndsAt, NOW)).toBe(0)
  })
})

describe('computeClinicHealthFlags — paymentIssue', () => {
  it.each(['PAST_DUE', 'UNPAID'] as const)('flags %s as a payment issue', (status) => {
    const row = makeRow({
      subscription: { status, trialEndsAt: null },
    })
    expect(computeClinicHealthFlags(row, NOW).paymentIssue).toBe(true)
  })

  it.each(['ACTIVE', 'TRIALING', 'CANCELED', 'PAUSED', 'INCOMPLETE'] as const)(
    'does not flag %s as a payment issue',
    (status) => {
      const row = makeRow({ subscription: { status, trialEndsAt: null } })
      expect(computeClinicHealthFlags(row, NOW).paymentIssue).toBe(false)
    },
  )

  it('does not flag a clinic with no subscription as a payment issue', () => {
    const row = makeRow({ subscription: null })
    expect(computeClinicHealthFlags(row, NOW).paymentIssue).toBe(false)
  })
})

describe('computeClinicHealthFlags — trialEndingSoon', () => {
  it('flags TRIALING with 7 or fewer days remaining', () => {
    const row = makeRow({
      subscription: {
        status: 'TRIALING',
        trialEndsAt: new Date(NOW + 3 * 86_400_000).toISOString(),
      },
    })
    expect(computeClinicHealthFlags(row, NOW).trialEndingSoon).toBe(true)
  })

  it('does not flag TRIALING with more than 7 days remaining', () => {
    const row = makeRow({
      subscription: {
        status: 'TRIALING',
        trialEndsAt: new Date(NOW + 20 * 86_400_000).toISOString(),
      },
    })
    expect(computeClinicHealthFlags(row, NOW).trialEndingSoon).toBe(false)
  })

  it('does not flag a non-TRIALING subscription even with a near trialEndsAt', () => {
    const row = makeRow({
      subscription: {
        status: 'ACTIVE',
        trialEndsAt: new Date(NOW + 1 * 86_400_000).toISOString(),
      },
    })
    expect(computeClinicHealthFlags(row, NOW).trialEndingSoon).toBe(false)
  })
})

describe('computeClinicHealthFlags — noDentists / noRecentAppointments', () => {
  it('flags zero dentists', () => {
    const row = makeRow({
      counts: { dentists: 0, activeUsers: 1, totalAppointments: 10, recentAppointments: 3 },
    })
    expect(computeClinicHealthFlags(row, NOW).noDentists).toBe(true)
  })

  it('does not flag when there is at least one dentist', () => {
    const row = makeRow({
      counts: { dentists: 1, activeUsers: 1, totalAppointments: 10, recentAppointments: 3 },
    })
    expect(computeClinicHealthFlags(row, NOW).noDentists).toBe(false)
  })

  it('flags zero recent appointments', () => {
    const row = makeRow({
      counts: { dentists: 1, activeUsers: 1, totalAppointments: 10, recentAppointments: 0 },
    })
    expect(computeClinicHealthFlags(row, NOW).noRecentAppointments).toBe(true)
  })

  it('does not flag when there are recent appointments', () => {
    const row = makeRow({
      counts: { dentists: 1, activeUsers: 1, totalAppointments: 10, recentAppointments: 2 },
    })
    expect(computeClinicHealthFlags(row, NOW).noRecentAppointments).toBe(false)
  })
})

describe('computeClinicHealthFlags — noRecentActivity', () => {
  it('flags when there is no activity timestamp at all', () => {
    const row = makeRow({ lastActivity: { timestamp: null, source: null } })
    expect(computeClinicHealthFlags(row, NOW).noRecentActivity).toBe(true)
  })

  it('flags when the last activity is more than 30 days ago', () => {
    const row = makeRow({
      lastActivity: {
        timestamp: new Date(NOW - 40 * 86_400_000).toISOString(),
        source: 'USER_LOGIN',
      },
    })
    expect(computeClinicHealthFlags(row, NOW).noRecentActivity).toBe(true)
  })

  it('does not flag when the last activity is within 30 days', () => {
    const row = makeRow({
      lastActivity: {
        timestamp: new Date(NOW - 2 * 86_400_000).toISOString(),
        source: 'AUDIT_LOG',
      },
    })
    expect(computeClinicHealthFlags(row, NOW).noRecentActivity).toBe(false)
  })
})

describe('computeClinicHealthFlags — incompleteFiscalSetup', () => {
  it('flags when fiscalSetupComplete is false', () => {
    const row = makeRow({ compliance: { fiscalSetupComplete: false } })
    expect(computeClinicHealthFlags(row, NOW).incompleteFiscalSetup).toBe(true)
  })

  it('flags when fiscalSetupComplete is null', () => {
    const row = makeRow({ compliance: { fiscalSetupComplete: null } })
    expect(computeClinicHealthFlags(row, NOW).incompleteFiscalSetup).toBe(true)
  })

  it('flags when compliance is absent entirely', () => {
    const row = makeRow({ compliance: undefined })
    expect(computeClinicHealthFlags(row, NOW).incompleteFiscalSetup).toBe(true)
  })

  it('does not flag when fiscalSetupComplete is true', () => {
    const row = makeRow({ compliance: { fiscalSetupComplete: true } })
    expect(computeClinicHealthFlags(row, NOW).incompleteFiscalSetup).toBe(false)
  })
})
