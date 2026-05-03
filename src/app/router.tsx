import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootRoute } from '@/app/RootRoute'
import {
  AdminClinicsPage,
  AdminUsersPage,
  AppointmentsPage,
  AuthRoutePage,
  DashboardPage,
  FinancePage,
  LandingPage,
  ProfileEditorPageCreate,
  ProfileEditorPageEdit,
  ProfilesListPage,
  ProfileServiceEditorPage,
  PublicProfilePage,
  SchedulePage,
  TeamPage,
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

const profilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
      <ProfilesListPage />
    </ProtectedAppRoute>
  ),
})

const newProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/novo',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <ProfileEditorPageCreate />
    </ProtectedAppRoute>
  ),
})

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/$profileId',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST']}>
      <ProfileEditorPageEdit />
    </ProtectedAppRoute>
  ),
})

const editProfileServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/$profileId/servicos/$serviceId',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <ProfileServiceEditorPage />
    </ProtectedAppRoute>
  ),
})

const publicProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/p/$slug',
  component: PublicProfilePage,
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

const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/financeiro',
  component: () => (
    <ProtectedAppRoute allowedRoles={['OWNER']}>
      <FinancePage />
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  appRoute,
  profilesRoute,
  newProfileRoute,
  editProfileRoute,
  editProfileServiceRoute,
  publicProfileRoute,
  appointmentsRoute,
  scheduleRoute,
  teamRoute,
  financeRoute,
  adminUsersRoute,
  adminClinicsRoute,
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
