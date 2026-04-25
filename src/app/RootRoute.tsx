import { Outlet } from '@tanstack/react-router'

import { AuthProvider } from '@/features/auth/providers/AuthProvider'

export function RootRoute() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
