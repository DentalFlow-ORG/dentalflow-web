import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { isValidPersonName } from '@/lib/field-formatters'
import { ApiError } from '@/services/http'

import { useAuth } from '../hooks/useAuth'
import { getGoogleOAuthStartUrl } from '../services/auth.service'
import type { AuthMode } from '../types'
import { splitFullName } from '../utils/name'
import { AuthTextField } from './AuthTextField'

type AuthFormProps = {
  mode: AuthMode
  googleAuthStatus?: 'disabled' | 'error' | 'cancelled'
}

const googleAuthMessages = {
  disabled: 'Login com Google indisponível no momento. Use e-mail e senha para continuar.',
  error: 'Não foi possível concluir o login com Google. Tente novamente ou use e-mail e senha.',
  cancelled: 'Login com Google cancelado. Você pode tentar novamente quando quiser.',
} as const

export function AuthForm({ mode, googleAuthStatus }: AuthFormProps) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { login, register } = useAuth()
  const [clinicName, setClinicName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const termsCheckboxId = useId()

  useEffect(() => {
    setError(null)
    setGoogleError(null)
    setAcceptedTerms(false)
  }, [mode])

  const handleGoogleOAuth = () => {
    setGoogleError(null)

    if (!env.apiUrl) {
      const message = 'Login com Google indisponível: URL da API não configurada.'
      setGoogleError(message)
      showAlert({ title: 'Google indisponível', description: message, tone: 'warning' })
      return
    }

    setIsGoogleLoading(true)
    window.location.assign(getGoogleOAuthStartUrl())
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedClinicName = clinicName.trim()
    const normalizedResponsibleName = responsibleName.trim()

    if (!isLogin && normalizedResponsibleName.split(/\s+/).length < 2) {
      showValidationError('Informe nome e sobrenome do responsável.')
      return
    }

    if (!isLogin && !isValidPersonName(normalizedResponsibleName)) {
      showValidationError('O nome do responsável não pode conter números ou caracteres especiais.')
      return
    }

    if (!isLogin && !acceptedTerms) {
      showValidationError(
        'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login({ email: normalizedEmail, password })
        showAlert({
          title: 'Acesso liberado',
          description: 'Login realizado com sucesso.',
          tone: 'success',
        })
      } else {
        const { firstName, lastName } = splitFullName(normalizedResponsibleName)

        await register({
          clinicName: normalizedClinicName,
          firstName,
          lastName,
          email: normalizedEmail,
          password,
          acceptedTerms: true,
        })
        showAlert({
          title: 'Conta criada',
          description: 'A clínica foi cadastrada com sucesso.',
          tone: 'success',
        })
      }

      await navigate({ to: '/app' })
    } catch (requestError) {
      const title = isLogin ? 'Não foi possível entrar' : 'Não foi possível criar a conta'
      const message = getAuthErrorMessage(requestError)
      setError(message)
      showAlert({ title, description: message, tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showValidationError = (message: string) => {
    setError(message)
    showAlert({ title: 'Cadastro incompleto', description: message, tone: 'warning' })
  }

  return (
    <div className="mt-7">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {isLogin ? <LockKeyhole className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-950">
            {isLogin ? 'Entrar com segurança' : 'Criar conta da clínica'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {isLogin
              ? 'Acesse o ambiente da sua clínica com e-mail e senha.'
              : 'Informe os dados principais para iniciar a operação no DentalFlow.'}
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden transition-[min-height] duration-300 ease-out">
        <form
          key={mode}
          className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          onSubmit={handleSubmit}
        >
          {!isLogin && (
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
          )}

          <AuthTextField
            label="E-mail profissional"
            placeholder="contato@clinica.com.br"
            icon={Mail}
            type="email"
            name="email"
            value={email}
            autoComplete="email"
            maxLength={254}
            onChange={setEmail}
          />
          <AuthTextField
            label="Senha"
            placeholder={isLogin ? 'Sua senha' : 'Crie uma senha segura'}
            icon={LockKeyhole}
            type="password"
            name="password"
            value={password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={8}
            maxLength={72}
            onChange={setPassword}
          />

          {!isLogin && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
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
          )}

          {error && <InlineFeedback>{error}</InlineFeedback>}

          <Button type="submit" size="xl" className="w-full" disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                {isLogin ? 'Entrar na plataforma' : 'Criar acesso seguro'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        ou
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full border-slate-200 bg-white text-slate-800 hover:border-primary/40 hover:bg-primary/5"
        onClick={handleGoogleOAuth}
        disabled={isSubmitting || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <img src="/brands/google.svg" alt="" aria-hidden="true" className="h-5 w-5" />
        )}
        {isLogin ? 'Entrar com Google' : 'Cadastrar com Google'}
      </Button>

      {googleAuthStatus && (
        <div className="mt-4">
          <InlineFeedback>{googleAuthMessages[googleAuthStatus]}</InlineFeedback>
        </div>
      )}
      {googleError && (
        <div className="mt-4">
          <InlineFeedback>{googleError}</InlineFeedback>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs leading-5 text-slate-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        O DentalFlow nunca recebe sua senha do Google.
      </div>

      <p className="mt-5 text-center text-sm text-slate-600">
        {isLogin ? 'Ainda não tem acesso?' : 'Já tem acesso criado?'}{' '}
        <Link
          to="/acessar"
          search={{ mode: isLogin ? 'register' : 'login' }}
          className="font-semibold text-primary hover:underline"
        >
          {isLogin ? 'Criar conta da clínica' : 'Entrar com minha conta'}
        </Link>
      </p>
    </div>
  )
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Não foi possível autenticar agora.'
}
