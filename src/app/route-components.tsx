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
