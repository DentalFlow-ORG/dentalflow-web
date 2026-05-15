import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootRoute } from '@/app/RootRoute'
import {
  AdminClinicsPage,
  AdminFinancePage,
  AdminUsersPage,
  CompliancePage,
  AppointmentsPage,
  AuthRoutePage,
  ClinicalRecordEditorPage,
  ClinicalRecordPrintPage,
  ClinicalRecordsPage,
  ClinicalTemplatesPage,
  CookiePolicyPage,
  DashboardPage,
  DataProcessingPage,
  DataRightsPage,
  DpoContactPage,
  FinancePage,
  FiscalInvoicesPage,
  InventoryPage,
  LandingPage,
  PatientsPage,
  PrivacyPolicyPage,
  PrivacyRequestFormPage,
  SchedulePage,
  SecurityPage,
  SubscriptionCancelPage,
  SubscriptionPage,
  SubscriptionSuccessPage,
  TeamMemberProfilePage,
  TeamPage,
  TermsOfUsePage,
} from '@/app/route-components'
import { AdminRoute } from '@/features/admin/components/AdminRoute'
import { ProtectedAppRoute } from '@/features/auth/components/ProtectedAppRoute'
import type { AuthMode } from '@/features/auth/types'

const rootRoute = createRootRoute({
  component: RootRoute,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/acessar',
  validateSearch: (search: Record<string, unknown>): { mode: AuthMode } => ({
    mode: search.mode === 'register' ? 'register' : 'login',
  }),
  component: AuthRoutePage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT', 'ADMIN']}>
      <DashboardPage />
    </ProtectedAppRoute>
  ),
})

const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/agendamentos',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <AppointmentsPage />
    </ProtectedAppRoute>
  ),
})

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/agenda',
  component: () => (
    <ProtectedAppRoute allowedRoles={['DENTIST']}>
      <SchedulePage />
    </ProtectedAppRoute>
  ),
})

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/equipe',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <TeamPage />
    </ProtectedAppRoute>
  ),
})

const teamMemberProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/equipe/$profileId',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <TeamMemberProfilePage />
    </ProtectedAppRoute>
  ),
})

const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/financeiro',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <FinancePage />
    </ProtectedAppRoute>
  ),
})

const fiscalInvoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/notas-fiscais',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <FiscalInvoicesPage />
    </ProtectedAppRoute>
  ),
})

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/pacientes',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <PatientsPage />
    </ProtectedAppRoute>
  ),
})

const subscriptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/assinatura',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST', 'ASSISTANT']}>
      <SubscriptionPage />
    </ProtectedAppRoute>
  ),
})

const subscriptionSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/assinatura/sucesso',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <SubscriptionSuccessPage />
    </ProtectedAppRoute>
  ),
})

const subscriptionCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/assinatura/cancelar',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <SubscriptionCancelPage />
    </ProtectedAppRoute>
  ),
})

const clinicalRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/prontuario',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <ClinicalRecordsPage />
    </ProtectedAppRoute>
  ),
})

const clinicalRecordEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/prontuario/$clinicalRecordId',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <ClinicalRecordEditorPage />
    </ProtectedAppRoute>
  ),
})

const clinicalRecordPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/prontuario/$clinicalRecordId/imprimir',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <ClinicalRecordPrintPage />
    </ProtectedAppRoute>
  ),
})

const clinicalTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/modelos-clinicos',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <ClinicalTemplatesPage />
    </ProtectedAppRoute>
  ),
})

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/estoque',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <InventoryPage />
    </ProtectedAppRoute>
  ),
})

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/admin/users',
  component: () => (
    <AdminRoute>
      <AdminUsersPage />
    </AdminRoute>
  ),
})

const adminClinicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/admin/clinics',
  component: () => (
    <AdminRoute>
      <AdminClinicsPage />
    </AdminRoute>
  ),
})

const adminFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/admin/financeiro',
  component: () => (
    <AdminRoute>
      <AdminFinancePage />
    </AdminRoute>
  ),
})

const complianceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/compliance',
  component: () => (
    <AdminRoute>
      <CompliancePage />
    </AdminRoute>
  ),
})

// Legal & compliance routes (public)
const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/politica-de-privacidade',
  component: PrivacyPolicyPage,
})

const termsOfUseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/termos-de-uso',
  component: TermsOfUsePage,
})

const cookiePolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/politica-de-cookies',
  component: CookiePolicyPage,
})

const dataProcessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tratamento-de-dados',
  component: DataProcessingPage,
})

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seguranca',
  component: SecurityPage,
})

const dataRightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/direitos-do-titular',
  component: DataRightsPage,
})

const dpoContactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/encarregado',
  component: DpoContactPage,
})

const privacyRequestFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/direitos-do-titular/solicitar',
  component: PrivacyRequestFormPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  appRoute,
  appointmentsRoute,
  scheduleRoute,
  teamRoute,
  teamMemberProfileRoute,
  financeRoute,
  fiscalInvoicesRoute,
  patientsRoute,
  subscriptionRoute,
  subscriptionSuccessRoute,
  subscriptionCancelRoute,
  clinicalRecordsRoute,
  clinicalRecordEditorRoute,
  clinicalRecordPrintRoute,
  clinicalTemplatesRoute,
  inventoryRoute,
  adminUsersRoute,
  adminClinicsRoute,
  adminFinanceRoute,
  complianceRoute,
  privacyPolicyRoute,
  termsOfUseRoute,
  cookiePolicyRoute,
  dataProcessingRoute,
  securityRoute,
  dataRightsRoute,
  dpoContactRoute,
  privacyRequestFormRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
