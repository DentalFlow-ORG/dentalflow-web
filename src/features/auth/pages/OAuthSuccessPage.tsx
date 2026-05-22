import { Navigate, useNavigate } from '@tanstack/react-router'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { useAuth } from '../hooks/useAuth'

export function OAuthSuccessPage() {
  useForceLightTheme()
  const navigate = useNavigate()
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  useEffect(() => {
    if (isBootstrapping || !isAuthenticated || !user) return
    void navigate({
      to: user.isProfileComplete === false ? '/acessar/completar-perfil' : '/app',
      replace: true,
    })
  }, [isAuthenticated, isBootstrapping, navigate, user])

  if (!isBootstrapping && !isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-950/10">
        <div className="flex justify-center">
          <BrandLink compact />
        </div>
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">Validando acesso</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Estamos finalizando seu login com Google e preparando o ambiente correto.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Aguarde um instante
        </div>
      </div>
    </main>
  )
}
