import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootRoute } from '@/app/RootRoute'
import {
  AdminClinicsPage,
  AdminDashboardPage,
  AdminFinancePage,
  AdminUsersPage,
  AgendaFeaturePage,
  AiFeaturePage,
  ClinicalRecordsFeaturePage,
  CompliancePage,
  AppointmentsPage,
  AuthRoutePage,
  CompleteProfilePage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ClinicalRecordEditorPage,
  ClinicalRecordPrintPage,
  ClinicalRecordsPage,
  CookiePolicyPage,
  DashboardPage,
  DataProcessingPage,
  DataRightsPage,
  DentistHomePage,
  DpoContactPage,
  FaqPage,
  FinancePage,
  FinanceFeaturePage,
  FeaturesPage,
  FiscalInvoicesPage,
  ForDentistPage,
  ForManagerPage,
  ForNewClinicPage,
  ForSecretaryPage,
  IntegrationsPage,
  InventoryPage,
  LandingPage,
  FiscalFeaturePage,
  FiscalProfilePage,
  InventoryFeaturePage,
  NotificationSettingsPage,
  OAuthSuccessPage,
  PatientsAttentionPage,
  PatientsFeaturePage,
  PlansPage,
  ReportsFeaturePage,
  ReportsPage,
  SettingsPage,
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
  WhatsappFeaturePage,
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
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode: AuthMode; googleAuth?: 'disabled' | 'error' | 'cancelled' } => ({
    mode: search.mode === 'register' ? 'register' : 'login',
    googleAuth:
      search.googleAuth === 'disabled' ||
      search.googleAuth === 'error' ||
      search.googleAuth === 'cancelled'
        ? search.googleAuth
        : undefined,
  }),
  component: AuthRoutePage,
})

const oauthSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/acessar/oauth/sucesso',
  component: OAuthSuccessPage,
})

const completeProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/acessar/completar-perfil',
  component: CompleteProfilePage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recuperar-senha',
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recuperar-senha/redefinir',
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ResetPasswordPage,
})

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades',
  component: FeaturesPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <DashboardPage />
    </ProtectedAppRoute>
  ),
})

// Home exclusiva do DENTIST — consultas do dia + atalhos
const dentistHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/inicio',
  component: () => (
    <ProtectedAppRoute allowedRoles={['DENTIST']}>
      <DentistHomePage />
    </ProtectedAppRoute>
  ),
})

// Dashboard administrativo — sem dados de clínica
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/admin',
  component: () => (
    <AdminRoute>
      <AdminDashboardPage />
    </AdminRoute>
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
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === 'string' ? search.session_id : undefined,
  }),
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

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/estoque',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <InventoryPage />
    </ProtectedAppRoute>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/configuracoes',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <SettingsPage />
    </ProtectedAppRoute>
  ),
})

const notificationSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/configuracoes/notificacoes',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <NotificationSettingsPage />
    </ProtectedAppRoute>
  ),
})

const fiscalProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/configuracoes/fiscal',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <FiscalProfilePage />
    </ProtectedAppRoute>
  ),
})

const patientsAttentionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/pacientes/atencao',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <PatientsAttentionPage />
    </ProtectedAppRoute>
  ),
})

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/relatorios',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <ReportsPage />
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
  path: '/app/admin/compliance',
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

// ── New public marketing routes ──

const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/planos',
  component: PlansPage,
})

const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integracoes',
  component: IntegrationsPage,
})

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perguntas-frequentes',
  component: FaqPage,
})

const forSecretaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para-secretarias',
  component: ForSecretaryPage,
})

const forDentistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para-dentistas',
  component: ForDentistPage,
})

const forManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para-gestores',
  component: ForManagerPage,
})

const forNewClinicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para-clinicas-em-abertura',
  component: ForNewClinicPage,
})

const agendaFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/agenda',
  component: AgendaFeaturePage,
})

const financeFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/financeiro',
  component: FinanceFeaturePage,
})

const aiFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/ia',
  component: AiFeaturePage,
})

const whatsappFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/whatsapp',
  component: WhatsappFeaturePage,
})

const patientsFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/pacientes',
  component: PatientsFeaturePage,
})

const clinicalRecordsFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/prontuarios',
  component: ClinicalRecordsFeaturePage,
})

const inventoryFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/estoque',
  component: InventoryFeaturePage,
})

const reportsFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/relatorios',
  component: ReportsFeaturePage,
})

const fiscalFeatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/funcionalidades/controle-fiscal',
  component: FiscalFeaturePage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  oauthSuccessRoute,
  completeProfileRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  featuresRoute,
  appRoute,
  dentistHomeRoute,
  appointmentsRoute,
  scheduleRoute,
  teamRoute,
  teamMemberProfileRoute,
  financeRoute,
  fiscalInvoicesRoute,
  patientsRoute,
  patientsAttentionRoute,
  reportsRoute,
  subscriptionRoute,
  subscriptionSuccessRoute,
  subscriptionCancelRoute,
  clinicalRecordsRoute,
  clinicalRecordEditorRoute,
  clinicalRecordPrintRoute,
  inventoryRoute,
  settingsRoute,
  notificationSettingsRoute,
  fiscalProfileRoute,
  adminDashboardRoute,
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
  plansRoute,
  integrationsRoute,
  faqRoute,
  forSecretaryRoute,
  forDentistRoute,
  forManagerRoute,
  forNewClinicRoute,
  agendaFeatureRoute,
  financeFeatureRoute,
  aiFeatureRoute,
  whatsappFeatureRoute,
  patientsFeatureRoute,
  clinicalRecordsFeatureRoute,
  inventoryFeatureRoute,
  reportsFeatureRoute,
  fiscalFeatureRoute,
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
