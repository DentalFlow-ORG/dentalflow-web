import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootRoute } from '@/app/RootRoute'
import { AuthRoutePage } from '@/features/auth/pages/AuthRoutePage'
import type { AuthMode } from '@/features/auth/types'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { LandingPage } from '@/features/marketing/pages/LandingPage'

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
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([indexRoute, authRoute, appRoute])

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
