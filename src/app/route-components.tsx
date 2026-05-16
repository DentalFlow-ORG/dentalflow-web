import { lazy } from 'react'

export const LandingPage = lazy(() =>
  import('@/features/marketing/pages/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
)

export const AuthRoutePage = lazy(() =>
  import('@/features/auth/pages/AuthRoutePage').then((m) => ({
    default: m.AuthRoutePage,
  })),
)

export const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

export const DentistHomePage = lazy(() =>
  import('@/features/dashboard/pages/DentistHomePage').then((m) => ({
    default: m.DentistHomePage,
  })),
)

export const AppointmentsPage = lazy(() =>
  import('@/features/scheduling/pages/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
)

export const SchedulePage = lazy(() =>
  import('@/features/scheduling/pages/SchedulePage').then((m) => ({
    default: m.SchedulePage,
  })),
)

export const TeamPage = lazy(() =>
  import('@/features/team/pages/TeamPage').then((m) => ({
    default: m.TeamPage,
  })),
)

export const TeamMemberProfilePage = lazy(() =>
  import('@/features/team/pages/TeamMemberProfilePage').then((m) => ({
    default: m.TeamMemberProfilePage,
  })),
)

export const FinancePage = lazy(() =>
  import('@/features/finance/pages/FinancePage').then((m) => ({
    default: m.FinancePage,
  })),
)

export const FiscalInvoicesPage = lazy(() =>
  import('@/features/fiscal/pages/FiscalInvoicesPage').then((m) => ({
    default: m.FiscalInvoicesPage,
  })),
)

export const CreateMemberPage = lazy(() =>
  import('@/features/team/pages/CreateMemberPage').then((m) => ({
    default: m.CreateMemberPage,
  })),
)

export const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)

export const AdminUsersPage = lazy(() =>
  import('@/features/admin/pages/AdminUsersPage').then((m) => ({
    default: m.AdminUsersPage,
  })),
)

export const AdminClinicsPage = lazy(() =>
  import('@/features/admin/pages/AdminClinicsPage').then((m) => ({
    default: m.AdminClinicsPage,
  })),
)

export const AdminFinancePage = lazy(() =>
  import('@/features/admin/pages/AdminFinancePage').then((m) => ({
    default: m.AdminFinancePage,
  })),
)

export const CompliancePage = lazy(() =>
  import('@/features/compliance/pages/CompliancePage').then((m) => ({
    default: m.CompliancePage,
  })),
)

export const PatientsPage = lazy(() =>
  import('@/features/patients/pages/PatientsPage').then((m) => ({
    default: m.PatientsPage,
  })),
)

export const SubscriptionPage = lazy(() =>
  import('@/features/billing/pages/SubscriptionPage').then((m) => ({
    default: m.SubscriptionPage,
  })),
)

export const SubscriptionSuccessPage = lazy(() =>
  import('@/features/billing/pages/SubscriptionSuccessPage').then((m) => ({
    default: m.SubscriptionSuccessPage,
  })),
)

export const SubscriptionCancelPage = lazy(() =>
  import('@/features/billing/pages/SubscriptionCancelPage').then((m) => ({
    default: m.SubscriptionCancelPage,
  })),
)

export const ClinicalRecordsPage = lazy(() =>
  import('@/features/clinical-records/pages/ClinicalRecordsPage').then((m) => ({
    default: m.ClinicalRecordsPage,
  })),
)

export const ClinicalRecordEditorPage = lazy(() =>
  import('@/features/clinical-records/pages/ClinicalRecordEditorPage').then((m) => ({
    default: m.ClinicalRecordEditorPage,
  })),
)

export const ClinicalRecordPrintPage = lazy(() =>
  import('@/features/clinical-records/pages/ClinicalRecordPrintPage').then((m) => ({
    default: m.ClinicalRecordPrintPage,
  })),
)

export const ClinicalTemplatesPage = lazy(() =>
  import('@/features/clinical-records/pages/ClinicalTemplatesPage').then((m) => ({
    default: m.ClinicalTemplatesPage,
  })),
)

export const InventoryPage = lazy(() =>
  import('@/features/inventory/pages/InventoryPage').then((m) => ({
    default: m.InventoryPage,
  })),
)

// Legal pages
export const PrivacyPolicyPage = lazy(() =>
  import('@/features/legal/pages/PrivacyPolicyPage').then((m) => ({
    default: m.PrivacyPolicyPage,
  })),
)

export const TermsOfUsePage = lazy(() =>
  import('@/features/legal/pages/TermsOfUsePage').then((m) => ({
    default: m.TermsOfUsePage,
  })),
)

export const CookiePolicyPage = lazy(() =>
  import('@/features/legal/pages/CookiePolicyPage').then((m) => ({
    default: m.CookiePolicyPage,
  })),
)

export const DataProcessingPage = lazy(() =>
  import('@/features/legal/pages/DataProcessingPage').then((m) => ({
    default: m.DataProcessingPage,
  })),
)

export const SecurityPage = lazy(() =>
  import('@/features/legal/pages/SecurityPage').then((m) => ({
    default: m.SecurityPage,
  })),
)

export const DataRightsPage = lazy(() =>
  import('@/features/legal/pages/DataRightsPage').then((m) => ({
    default: m.DataRightsPage,
  })),
)

export const DpoContactPage = lazy(() =>
  import('@/features/legal/pages/DpoContactPage').then((m) => ({
    default: m.DpoContactPage,
  })),
)

export const PrivacyRequestFormPage = lazy(() =>
  import('@/features/privacy/pages/PrivacyRequestFormPage').then((m) => ({
    default: m.PrivacyRequestFormPage,
  })),
)

