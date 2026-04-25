import { Link, useNavigate } from '@tanstack/react-router'
import { BarChart3, LogOut, UserRound } from 'lucide-react'
import { useEffect } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getUserDisplayName } from '@/features/auth/utils/name'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth()

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      navigate({ to: '/acessar', search: { mode: 'login' } })
    }
  }, [isAuthenticated, isBootstrapping, navigate])

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Carregando sessao...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <BrandLink />

          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Plataforma
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              Bem-vindo ao DentalFlow
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Esta e a primeira area protegida da aplicacao. A partir daqui,
              novas features devem ser adicionadas em `src/features`.
            </p>
          </div>

          <Button asChild>
            <Link to="/">Voltar para landing</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Usuario autenticado
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Nome</dt>
                <dd className="mt-1 text-slate-900">
                  {user ? getUserDisplayName(user) : '-'}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">E-mail</dt>
                <dd className="mt-1 text-slate-900">{user?.email ?? '-'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Perfil</dt>
                <dd className="mt-1 text-slate-900">{user?.role}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Proxima implementacao
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Conectar indicadores reais, clinicas, campanhas e funis usando
              services por feature e dados vindos do backend.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
