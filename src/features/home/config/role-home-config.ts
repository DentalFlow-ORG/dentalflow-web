/**
 * Role home and feature matrix configuration.
 *
 * PURPOSE
 * -------
 * This file is the single source of truth for:
 *   - Which route is the home/default route for each role.
 *   - Labels intended for each role's home experience.
 *   - Which high-level features each role should see, and at what level.
 *
 * AUTHORITY
 * ---------
 * This matrix is DOCUMENTATION and GUIDANCE for the home/dashboard refactor.
 * Route guards (ProtectedAppRoute, AdminRoute) and router allowedRoles remain
 * the authoritative enforcement layer. Do not remove those guards in favour of
 * this config alone.
 *
 * USAGE IN THIS BLOCK
 * -------------------
 * - getDeniedRedirectPath (ProtectedAppRoute) uses ROLE_HOME_ROUTES.
 * - AdminRoute non-admin redirect uses ROLE_HOME_ROUTES.OWNER.
 * - Future dashboard components will use this config to decide which sections
 *   to render and which to hide, replacing ad-hoc role checks.
 */

import type { AuthUserRole } from '@/features/auth/types'

// ── Home routes ───────────────────────────────────────────────────────────────

/**
 * Default authenticated route for each role.
 *
 * PATIENT is kept as the public root '/' because the patient portal is not yet
 * implemented. When it is, update this entry and add a proper guarded route.
 */
export const ROLE_HOME_ROUTES = {
  ADMIN: '/app/admin',
  OWNER: '/app',
  ASSISTANT: '/app',
  DENTIST: '/app/inicio',
  PATIENT: '/',
} as const satisfies Record<AuthUserRole, string>

// ── Home labels ───────────────────────────────────────────────────────────────

/**
 * Intended heading/label for each role's home dashboard.
 *
 * These are the target labels for the premium dashboard refactor (Blocks 3–6).
 * Do NOT wire these into the existing dashboard headings until the corresponding
 * block redesigns that page — this avoids a confusing half-state where the label
 * changes but the content does not.
 */
export const ROLE_HOME_LABELS = {
  ADMIN: 'Painel administrativo',
  OWNER: 'Minha clínica',
  ASSISTANT: 'Operação da clínica',
  DENTIST: 'Meu dia clínico',
  PATIENT: 'Portal do paciente',
} as const satisfies Record<AuthUserRole, string>

// ── Feature access matrix ─────────────────────────────────────────────────────

/**
 * Access level for a given feature + role combination.
 *
 * - editable    Full read/write access including create/update/delete.
 * - read-only   Visible but cannot be changed (e.g. DENTIST payment view).
 * - plan-gated  Accessible at the right plan tier; hidden on lower tiers.
 * - hidden      Not visible and not accessible (route denied or nav hidden).
 * - future      Planned but not yet implemented in the frontend.
 */
export type RoleFeatureAccess = 'editable' | 'read-only' | 'plan-gated' | 'hidden' | 'future'

/**
 * High-level features tracked in the dashboard/home matrix.
 * Add new entries as features are built; remove 'future' entries when shipped.
 */
export type HomeFeature =
  | 'home' // The role's own dashboard/home page
  | 'clinicAgenda' // Clinic-wide appointments (/app/agendamentos)
  | 'myAgenda' // Dentist's own schedule (/app/agenda)
  | 'createAppointment'
  | 'editAppointment'
  | 'cancelAppointment'
  | 'statusTransitions' // Appointment status changes (full vs. limited set)
  | 'paymentUpdate' // Recording/editing appointment payments
  | 'whatsappActions' // WhatsApp notifications / contact buttons
  | 'clinicalRecords' // Prontuários (/app/prontuario)
  | 'patients' // Patient list (/app/pacientes)
  | 'finance' // Financial overview (/app/financeiro)
  | 'stock' // Inventory (/app/estoque)
  | 'team' // Team profiles (/app/equipe)
  | 'googleCalendar' // Google Calendar integration
  | 'availability' // Professional schedule availability
  | 'subscription' // Billing / subscription management (/app/assinatura)
  | 'reports' // Reports (/app/relatorios)
  | 'settings' // Clinic settings (/app/configuracoes)
  | 'fiscalInvoices' // Fiscal invoices (/app/notas-fiscais)
  | 'adminPanel' // Platform administration (/app/admin)

type RoleMatrix = Record<AuthUserRole, Record<HomeFeature, RoleFeatureAccess>>

/**
 * Intended feature visibility/access per role.
 *
 * Notes on specific cells:
 *   DENTIST.statusTransitions = 'read-only': limited set (COMPLETED + NO_SHOW only),
 *     enforced by DENTIST_ALLOWED_TRANSITIONS in useSchedulePage.
 *   DENTIST.googleCalendar = 'future': the backend OAuth callback currently
 *     redirects to /app/agendamentos which DENTIST cannot access; full support
 *     requires a role-aware callback before enabling the UI.
 *   ASSISTANT.subscription = 'read-only': ASSISTANT can land on the subscription
 *     page if billing lapses, but cannot manage it — subscription management is
 *     an OWNER responsibility.
 *   PATIENT.*: the patient portal is not implemented; all entries are 'future'
 *     or 'hidden' to document intent without enabling accidental access.
 */
const ROLE_FEATURE_MATRIX: RoleMatrix = {
  OWNER: {
    home: 'editable',
    clinicAgenda: 'editable',
    myAgenda: 'hidden',
    createAppointment: 'editable',
    editAppointment: 'editable',
    cancelAppointment: 'editable',
    statusTransitions: 'editable',
    paymentUpdate: 'editable',
    whatsappActions: 'editable',
    clinicalRecords: 'editable',
    patients: 'editable',
    finance: 'plan-gated',
    stock: 'plan-gated',
    team: 'editable',
    googleCalendar: 'editable',
    availability: 'editable',
    subscription: 'editable',
    reports: 'plan-gated',
    settings: 'editable',
    fiscalInvoices: 'plan-gated',
    adminPanel: 'hidden',
  },

  ASSISTANT: {
    home: 'editable',
    clinicAgenda: 'editable',
    myAgenda: 'hidden',
    createAppointment: 'editable',
    editAppointment: 'editable',
    cancelAppointment: 'editable',
    statusTransitions: 'editable',
    paymentUpdate: 'editable',
    whatsappActions: 'editable',
    clinicalRecords: 'hidden', // route denied: allowedRoles=['OWNER','DENTIST']
    patients: 'editable',
    finance: 'hidden', // route denied: allowedRoles=['OWNER']
    stock: 'plan-gated',
    team: 'hidden', // route denied: allowedRoles=['OWNER']
    googleCalendar: 'hidden',
    availability: 'hidden',
    subscription: 'read-only',
    reports: 'plan-gated',
    settings: 'hidden', // notification sub-route only (partial access)
    fiscalInvoices: 'plan-gated',
    adminPanel: 'hidden',
  },

  DENTIST: {
    home: 'read-only', // own-day view, no business controls
    clinicAgenda: 'hidden',
    myAgenda: 'editable',
    createAppointment: 'hidden',
    editAppointment: 'hidden',
    cancelAppointment: 'hidden',
    statusTransitions: 'read-only', // limited: COMPLETED + NO_SHOW only
    paymentUpdate: 'read-only',
    whatsappActions: 'hidden',
    clinicalRecords: 'editable',
    patients: 'hidden',
    finance: 'hidden',
    stock: 'hidden',
    team: 'read-only', // can view own profile via /app/equipe/$profileId
    googleCalendar: 'future',
    availability: 'editable', // via agenda tab
    subscription: 'read-only',
    reports: 'hidden',
    settings: 'hidden',
    fiscalInvoices: 'hidden',
    adminPanel: 'hidden',
  },

  ADMIN: {
    home: 'editable', // admin panel — no clinic operational data
    clinicAgenda: 'hidden',
    myAgenda: 'hidden',
    createAppointment: 'hidden',
    editAppointment: 'hidden',
    cancelAppointment: 'hidden',
    statusTransitions: 'hidden',
    paymentUpdate: 'hidden',
    whatsappActions: 'hidden',
    clinicalRecords: 'hidden',
    patients: 'hidden',
    finance: 'hidden',
    stock: 'hidden',
    team: 'hidden',
    googleCalendar: 'hidden',
    availability: 'hidden',
    subscription: 'hidden', // ADMIN has no clinic subscription
    reports: 'hidden',
    settings: 'hidden',
    fiscalInvoices: 'hidden',
    adminPanel: 'editable',
  },

  PATIENT: {
    home: 'future',
    clinicAgenda: 'hidden',
    myAgenda: 'hidden',
    createAppointment: 'future',
    editAppointment: 'future',
    cancelAppointment: 'future',
    statusTransitions: 'hidden',
    paymentUpdate: 'hidden',
    whatsappActions: 'hidden',
    clinicalRecords: 'future',
    patients: 'hidden',
    finance: 'hidden',
    stock: 'hidden',
    team: 'hidden',
    googleCalendar: 'hidden',
    availability: 'hidden',
    subscription: 'future',
    reports: 'hidden',
    settings: 'future',
    fiscalInvoices: 'hidden',
    adminPanel: 'hidden',
  },
}

// ── Helper functions ───────────────────────────────────────────────────────────

/** Returns the default authenticated route for the given role. */
export function getRoleHomeRoute(role: AuthUserRole): string {
  return ROLE_HOME_ROUTES[role]
}

/** Returns the intended home label for the given role. */
export function getRoleHomeLabel(role: AuthUserRole): string {
  return ROLE_HOME_LABELS[role]
}

/**
 * Returns the intended access level for a given role + feature combination.
 * For dashboard/home rendering guidance only — enforce access via route guards.
 */
export function getRoleFeatureAccess(role: AuthUserRole, feature: HomeFeature): RoleFeatureAccess {
  return ROLE_FEATURE_MATRIX[role][feature]
}
