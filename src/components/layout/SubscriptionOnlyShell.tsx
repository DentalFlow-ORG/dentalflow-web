import { LogOut } from 'lucide-react'
import { type ReactNode } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getUserDisplayName } from '@/features/auth/utils/name'

type Props = {
  children: ReactNode
}

export function SubscriptionOnlyShell({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <BrandLink />
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-950">{getUserDisplayName(user)}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
