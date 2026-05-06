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

export const ProfilesListPage = lazy(() =>
  import('@/features/profiles/pages/ProfilesListPage').then((m) => ({
    default: m.ProfilesListPage,
  })),
)

export const ProfileEditorPageCreate = lazy(() =>
  import('@/features/profiles/pages/ProfileEditorPage').then((m) => ({
    default: () => <m.ProfileEditorPage mode="create" />,
  })),
)

export const ProfileEditorPageEdit = lazy(() =>
  import('@/features/profiles/pages/ProfileEditorPage').then((m) => ({
    default: () => <m.ProfileEditorPage mode="edit" />,
  })),
)

export const ProfileServiceEditorPage = lazy(() =>
  import('@/features/profiles/pages/ProfileServiceEditorPage').then((m) => ({
    default: m.ProfileServiceEditorPage,
  })),
)

export const PublicProfilePage = lazy(() =>
  import('@/features/profiles/pages/PublicProfilePage').then((m) => ({
    default: m.PublicProfilePage,
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
