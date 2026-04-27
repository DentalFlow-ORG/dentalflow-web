import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { lazy } from 'react'

import { RootRoute } from '@/app/RootRoute'
import { ProtectedAppRoute } from '@/features/auth/components/ProtectedAppRoute'
import type { AuthMode } from '@/features/auth/types'

const LandingPage = lazy(() =>
  import('@/features/marketing/pages/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
)

const AuthRoutePage = lazy(() =>
  import('@/features/auth/pages/AuthRoutePage').then((m) => ({
    default: m.AuthRoutePage,
  })),
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

const ProfilesListPage = lazy(() =>
  import('@/features/profiles/pages/ProfilesListPage').then((m) => ({
    default: m.ProfilesListPage,
  })),
)

const ProfileEditorPageCreate = lazy(() =>
  import('@/features/profiles/pages/ProfileEditorPage').then((m) => ({
    default: () => <m.ProfileEditorPage mode="create" />,
  })),
)

const ProfileEditorPageEdit = lazy(() =>
  import('@/features/profiles/pages/ProfileEditorPage').then((m) => ({
    default: () => <m.ProfileEditorPage mode="edit" />,
  })),
)

const ProfileServiceEditorPage = lazy(() =>
  import('@/features/profiles/pages/ProfileServiceEditorPage').then((m) => ({
    default: m.ProfileServiceEditorPage,
  })),
)

const PublicProfilePage = lazy(() =>
  import('@/features/profiles/pages/PublicProfilePage').then((m) => ({
    default: m.PublicProfilePage,
  })),
)

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  appRoute,
  profilesRoute,
  newProfileRoute,
  editProfileRoute,
  editProfileServiceRoute,
  publicProfileRoute,
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
