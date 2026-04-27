import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootRoute } from '@/app/RootRoute'
import {
  AppointmentsPage,
  AuthRoutePage,
  CreateMemberPage,
  DashboardPage,
  LandingPage,
  ProfileEditorPageCreate,
  ProfileEditorPageEdit,
  ProfilesListPage,
  ProfileServiceEditorPage,
  PublicProfilePage,
  SchedulePage,
  TeamPage,
} from '@/app/route-components'
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
    <ProtectedAppRoute>
      <DashboardPage />
    </ProtectedAppRoute>
  ),
})

const profilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis',
  component: () => (
    <ProtectedAppRoute>
      <ProfilesListPage />
    </ProtectedAppRoute>
  ),
})

const newProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/novo',
  component: () => (
    <ProtectedAppRoute>
      <ProfileEditorPageCreate />
    </ProtectedAppRoute>
  ),
})

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/$profileId',
  component: () => (
    <ProtectedAppRoute>
      <ProfileEditorPageEdit />
    </ProtectedAppRoute>
  ),
})

const editProfileServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/perfis/$profileId/servicos/$serviceId',
  component: () => (
    <ProtectedAppRoute>
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
    <ProtectedAppRoute>
      <AppointmentsPage />
    </ProtectedAppRoute>
  ),
})

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/agenda',
  component: () => (
    <ProtectedAppRoute>
      <SchedulePage />
    </ProtectedAppRoute>
  ),
})

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/equipe',
  component: () => (
    <ProtectedAppRoute>
      <TeamPage />
    </ProtectedAppRoute>
  ),
})

const newMemberRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/equipe/novo',
  component: () => (
    <ProtectedAppRoute>
      <CreateMemberPage />
    </ProtectedAppRoute>
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
  newMemberRoute,
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
