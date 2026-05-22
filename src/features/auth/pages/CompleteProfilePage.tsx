import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building2, Loader2, UserRound } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { isValidPersonName } from '@/lib/field-formatters'
import { ApiError } from '@/services/http'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { AuthTextField } from '../components/AuthTextField'
import { useAuth } from '../hooks/useAuth'
import { splitFullName } from '../utils/name'

export function CompleteProfilePage() {
  useForceLightTheme()
  const termsCheckboxId = useId()
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { user, isAuthenticated, isBootstrapping, completeProfile } = useAuth()
  const [clinicName, setClinicName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setResponsibleName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim())
  }, [user])

  if (isBootstrapping) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  if (user?.isProfileComplete !== false) {
    return <Navigate to="/app" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const normalizedName = responsibleName.trim()
    const normalizedClinic = clinicName.trim()

    if (normalizedName.split(/\s+/).length < 2 || !isValidPersonName(normalizedName)) {
      setError('Informe nome e sobrenome do responsável.')
      return
    }

    if (normalizedClinic.length < 2) {
      setError('Informe o nome da clínica.')
      return
    }

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }

    const { firstName, lastName } = splitFullName(normalizedName)
    setIsSubmitting(true)

    try {
      await completeProfile({
        clinicName: normalizedClinic,
        firstName,
        lastName,
        acceptedTerms: true,
      })
      showAlert({
        title: 'Perfil concluído',
        description: 'Sua clínica foi preparada com sucesso.',
        tone: 'success',
      })
      await navigate({ to: '/app', replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Não foi possível concluir o perfil agora.'
      setError(message)
      showAlert({ title: 'Não foi possível concluir', description: message, tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-5xl justify-center">
        <BrandLink compact />
      </div>

      <section className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1fr]">
        <aside className="rounded-lg border border-primary/15 bg-primary p-6 text-white shadow-xl shadow-primary/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-primary">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            Complete seu acesso DentalFlow
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/75">
            O Google confirmou seu e-mail. Falta vincular os dados mínimos exigidos
            pelo cadastro da clínica antes de liberar o app.
          </p>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 sm:p-7"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthTextField
              label="Nome da clínica"
              placeholder="Clínica DentalFlow"
              icon={Building2}
              name="clinicName"
              value={clinicName}
              autoComplete="organization"
              minLength={2}
              maxLength={100}
              onChange={setClinicName}
            />
            <AuthTextField
              label="Responsável"
              placeholder="Nome completo"
              icon={UserRound}
              name="responsibleName"
              value={responsibleName}
              autoComplete="name"
              minLength={2}
              maxLength={100}
              onChange={setResponsibleName}
            />
          </div>

          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <input
                id={termsCheckboxId}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                required
              />
              <label htmlFor={termsCheckboxId} className="text-sm leading-6 text-slate-600">
                Li e aceito os{' '}
                <Link
                  to="/termos-de-uso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link
                  to="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>
          </div>

          {error && <div className="mt-5"><InlineFeedback>{error}</InlineFeedback></div>}

          <Button type="submit" size="xl" className="mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Concluindo...
              </>
            ) : (
              <>
                Concluir cadastro
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </section>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    </main>
  )
}
