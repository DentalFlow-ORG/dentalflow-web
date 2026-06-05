import {
  ROLE_HOME_ROUTES,
  ROLE_HOME_LABELS,
  getRoleHomeRoute,
  getRoleHomeLabel,
  getRoleFeatureAccess,
  type HomeFeature,
} from '@/features/home/config/role-home-config'
import type { AuthUserRole } from '@/features/auth/types'

// ── ROLE_HOME_ROUTES ──────────────────────────────────────────────────────────

describe('ROLE_HOME_ROUTES — correct home route per role', () => {
  it('maps ADMIN to /app/admin', () => {
    expect(ROLE_HOME_ROUTES.ADMIN).toBe('/app/admin')
  })

  it('maps OWNER to /app', () => {
    expect(ROLE_HOME_ROUTES.OWNER).toBe('/app')
  })

  it('maps ASSISTANT to /app', () => {
    expect(ROLE_HOME_ROUTES.ASSISTANT).toBe('/app')
  })

  it('maps DENTIST to /app/inicio', () => {
    expect(ROLE_HOME_ROUTES.DENTIST).toBe('/app/inicio')
  })

  it('maps PATIENT to / (public root, portal not yet implemented)', () => {
    expect(ROLE_HOME_ROUTES.PATIENT).toBe('/')
  })

  it('has an entry for every AuthUserRole', () => {
    const roles: AuthUserRole[] = ['ADMIN', 'OWNER', 'ASSISTANT', 'DENTIST', 'PATIENT']
    roles.forEach((role) => {
      expect(ROLE_HOME_ROUTES[role]).toBeDefined()
      expect(typeof ROLE_HOME_ROUTES[role]).toBe('string')
    })
  })
})

// ── getDeniedRedirectPath compatibility ───────────────────────────────────────
// Ensures ROLE_HOME_ROUTES matches what the pre-existing hardcoded redirect
// logic in ProtectedAppRoute produced. Changing these values would be a
// redirect behavior change — do not change without product sign-off.

describe('ROLE_HOME_ROUTES — redirect compatibility guard', () => {
  it('ADMIN maps to /app/admin (matches old getDeniedRedirectPath)', () => {
    expect(ROLE_HOME_ROUTES.ADMIN).toBe('/app/admin')
  })

  it('DENTIST maps to /app/inicio (matches old getDeniedRedirectPath)', () => {
    expect(ROLE_HOME_ROUTES.DENTIST).toBe('/app/inicio')
  })

  it('PATIENT maps to / (matches old getDeniedRedirectPath)', () => {
    expect(ROLE_HOME_ROUTES.PATIENT).toBe('/')
  })

  it('OWNER and ASSISTANT both map to /app (matches old default fallback)', () => {
    expect(ROLE_HOME_ROUTES.OWNER).toBe('/app')
    expect(ROLE_HOME_ROUTES.ASSISTANT).toBe('/app')
  })
})

// ── ROLE_HOME_LABELS ──────────────────────────────────────────────────────────

describe('ROLE_HOME_LABELS', () => {
  it('has a non-empty label for every role', () => {
    const roles: AuthUserRole[] = ['ADMIN', 'OWNER', 'ASSISTANT', 'DENTIST', 'PATIENT']
    roles.forEach((role) => {
      expect(typeof ROLE_HOME_LABELS[role]).toBe('string')
      expect(ROLE_HOME_LABELS[role].length).toBeGreaterThan(0)
    })
  })
})

// ── getRoleHomeRoute helper ───────────────────────────────────────────────────

describe('getRoleHomeRoute', () => {
  it('returns /app/admin for ADMIN', () => {
    expect(getRoleHomeRoute('ADMIN')).toBe('/app/admin')
  })

  it('returns /app for OWNER', () => {
    expect(getRoleHomeRoute('OWNER')).toBe('/app')
  })

  it('returns /app for ASSISTANT', () => {
    expect(getRoleHomeRoute('ASSISTANT')).toBe('/app')
  })

  it('returns /app/inicio for DENTIST', () => {
    expect(getRoleHomeRoute('DENTIST')).toBe('/app/inicio')
  })

  it('returns / for PATIENT', () => {
    expect(getRoleHomeRoute('PATIENT')).toBe('/')
  })
})

// ── getRoleHomeLabel helper ───────────────────────────────────────────────────

describe('getRoleHomeLabel', () => {
  it('returns a non-empty string for every role', () => {
    const roles: AuthUserRole[] = ['ADMIN', 'OWNER', 'ASSISTANT', 'DENTIST', 'PATIENT']
    roles.forEach((role) => {
      expect(typeof getRoleHomeLabel(role)).toBe('string')
      expect(getRoleHomeLabel(role).length).toBeGreaterThan(0)
    })
  })
})

// ── Feature matrix — OWNER ────────────────────────────────────────────────────

describe('Feature matrix — OWNER', () => {
  it('has editable access to clinic agenda', () => {
    expect(getRoleFeatureAccess('OWNER', 'clinicAgenda')).toBe('editable')
  })

  it('has editable access to clinical records', () => {
    expect(getRoleFeatureAccess('OWNER', 'clinicalRecords')).toBe('editable')
  })

  it('has editable access to Google Calendar', () => {
    expect(getRoleFeatureAccess('OWNER', 'googleCalendar')).toBe('editable')
  })

  it('has plan-gated access to finance', () => {
    expect(getRoleFeatureAccess('OWNER', 'finance')).toBe('plan-gated')
  })

  it('has plan-gated access to stock', () => {
    expect(getRoleFeatureAccess('OWNER', 'stock')).toBe('plan-gated')
  })

  it('has editable access to subscription management', () => {
    expect(getRoleFeatureAccess('OWNER', 'subscription')).toBe('editable')
  })

  it('has hidden access to admin panel', () => {
    expect(getRoleFeatureAccess('OWNER', 'adminPanel')).toBe('hidden')
  })

  it('has hidden access to myAgenda (uses clinic agenda instead)', () => {
    expect(getRoleFeatureAccess('OWNER', 'myAgenda')).toBe('hidden')
  })
})

// ── Feature matrix — ASSISTANT ────────────────────────────────────────────────

describe('Feature matrix — ASSISTANT', () => {
  it('has hidden access to clinical records (route denied)', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'clinicalRecords')).toBe('hidden')
  })

  it('has hidden access to finance', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'finance')).toBe('hidden')
  })

  it('has hidden access to Google Calendar', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'googleCalendar')).toBe('hidden')
  })

  it('has hidden access to team management', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'team')).toBe('hidden')
  })

  it('has read-only access to subscription (can see but not manage)', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'subscription')).toBe('read-only')
  })

  it('has editable access to patients', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'patients')).toBe('editable')
  })

  it('has editable access to clinic agenda', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'clinicAgenda')).toBe('editable')
  })

  it('has hidden access to own agenda (uses clinic agenda instead)', () => {
    expect(getRoleFeatureAccess('ASSISTANT', 'myAgenda')).toBe('hidden')
  })
})

// ── Feature matrix — DENTIST ──────────────────────────────────────────────────

describe('Feature matrix — DENTIST', () => {
  it('has hidden access to clinic-wide agenda', () => {
    expect(getRoleFeatureAccess('DENTIST', 'clinicAgenda')).toBe('hidden')
  })

  it('has editable access to own agenda', () => {
    expect(getRoleFeatureAccess('DENTIST', 'myAgenda')).toBe('editable')
  })

  it('has hidden access to create appointment', () => {
    expect(getRoleFeatureAccess('DENTIST', 'createAppointment')).toBe('hidden')
  })

  it('has read-only status transitions (limited set: COMPLETED + NO_SHOW)', () => {
    expect(getRoleFeatureAccess('DENTIST', 'statusTransitions')).toBe('read-only')
  })

  it('has read-only access to payment update', () => {
    expect(getRoleFeatureAccess('DENTIST', 'paymentUpdate')).toBe('read-only')
  })

  it('has editable access to clinical records', () => {
    expect(getRoleFeatureAccess('DENTIST', 'clinicalRecords')).toBe('editable')
  })

  it('has future access to Google Calendar (backend callback not yet DENTIST-aware)', () => {
    expect(getRoleFeatureAccess('DENTIST', 'googleCalendar')).toBe('future')
  })

  it('has editable access to own availability', () => {
    expect(getRoleFeatureAccess('DENTIST', 'availability')).toBe('editable')
  })

  it('has hidden access to patients', () => {
    expect(getRoleFeatureAccess('DENTIST', 'patients')).toBe('hidden')
  })

  it('has hidden access to finance', () => {
    expect(getRoleFeatureAccess('DENTIST', 'finance')).toBe('hidden')
  })

  it('has hidden access to admin panel', () => {
    expect(getRoleFeatureAccess('DENTIST', 'adminPanel')).toBe('hidden')
  })
})

// ── Feature matrix — ADMIN ────────────────────────────────────────────────────

describe('Feature matrix — ADMIN', () => {
  it('has editable access to admin panel', () => {
    expect(getRoleFeatureAccess('ADMIN', 'adminPanel')).toBe('editable')
  })

  it('has hidden access to clinic agenda', () => {
    expect(getRoleFeatureAccess('ADMIN', 'clinicAgenda')).toBe('hidden')
  })

  it('has hidden access to subscription (ADMIN has no clinic subscription)', () => {
    expect(getRoleFeatureAccess('ADMIN', 'subscription')).toBe('hidden')
  })

  it('has hidden access to clinical records', () => {
    expect(getRoleFeatureAccess('ADMIN', 'clinicalRecords')).toBe('hidden')
  })
})

// ── Feature matrix — PATIENT ──────────────────────────────────────────────────

describe('Feature matrix — PATIENT', () => {
  it('marks home as future (patient portal not implemented)', () => {
    expect(getRoleFeatureAccess('PATIENT', 'home')).toBe('future')
  })

  it('has a valid home route pointing to public root', () => {
    expect(getRoleHomeRoute('PATIENT')).toBe('/')
  })

  it('has hidden access to admin panel', () => {
    expect(getRoleFeatureAccess('PATIENT', 'adminPanel')).toBe('hidden')
  })
})

// ── Matrix completeness ───────────────────────────────────────────────────────

describe('ROLE_FEATURE_MATRIX — completeness', () => {
  const allFeatures: HomeFeature[] = [
    'home', 'clinicAgenda', 'myAgenda', 'createAppointment', 'editAppointment',
    'cancelAppointment', 'statusTransitions', 'paymentUpdate', 'whatsappActions',
    'clinicalRecords', 'patients', 'finance', 'stock', 'team',
    'googleCalendar', 'availability', 'subscription', 'reports', 'settings',
    'fiscalInvoices', 'adminPanel',
  ]
  const allRoles: AuthUserRole[] = ['ADMIN', 'OWNER', 'ASSISTANT', 'DENTIST', 'PATIENT']

  it('has an entry for every role+feature combination', () => {
    allRoles.forEach((role) => {
      allFeatures.forEach((feature) => {
        const access = getRoleFeatureAccess(role, feature)
        expect(
          access,
          `${role}.${feature} should have an access value`,
        ).toMatch(/^(editable|read-only|plan-gated|hidden|future)$/)
      })
    })
  })
})
