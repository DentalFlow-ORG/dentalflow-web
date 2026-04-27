import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building2, LockKeyhole, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/http'

import { useAuth } from '../hooks/useAuth'
import type { AuthMode } from '../types'
import { splitFullName } from '../utils/name'
import { AuthTextField } from './AuthTextField'

type AuthFormProps = {
  mode: AuthMode
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { login, register } = useAuth()
  const [clinicName, setClinicName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setError(null)
  }, [mode])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedClinicName = clinicName.trim()
    const normalizedResponsibleName = responsibleName.trim()

    if (!isLogin && normalizedResponsibleName.split(/\s+/).length < 2) {
      const message = 'Informe nome e sobrenome do responsavel.'
      setError(message)
      showAlert({
        title: 'Cadastro incompleto',
        description: message,
        tone: 'warning',
      })
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
        })
        showAlert({
          title: 'Conta criada',
          description: 'Seu acesso de teste foi criado com sucesso.',
          tone: 'success',
        })
      }

      await navigate({ to: '/app' })
    } catch (requestError) {
      const title = isLogin
        ? 'Nao foi possivel entrar'
        : 'Nao foi possivel criar a conta'

      if (requestError instanceof ApiError) {
        setError(requestError.message)
        showAlert({
          title,
          description: requestError.message,
          tone: 'error',
        })
      } else if (requestError instanceof Error) {
        setError(requestError.message)
        showAlert({
          title,
          description: requestError.message,
          tone: 'error',
        })
      } else {
        const message = 'Nao foi possivel autenticar agora.'
        setError(message)
        showAlert({ title: message, tone: 'error' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
          {isLogin ? (
            <LockKeyhole className="h-6 w-6" />
          ) : (
            <UserPlus className="h-6 w-6" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            {isLogin ? 'Entrar na plataforma' : 'Criar acesso de teste'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? 'Use seus dados para acessar a demonstracao.'
              : 'Cadastre a clinica para iniciar uma avaliacao sem cartao.'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden transition-[min-height] duration-300 ease-out">
        <form
          key={mode}
          className="mt-8 space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          onSubmit={handleSubmit}
        >
          {!isLogin && (
            <div className="space-y-5">
              <AuthTextField
                label="Nome da clinica"
                placeholder="Clinica DentalFlow"
                icon={Building2}
                name="clinicName"
                value={clinicName}
                autoComplete="organization"
                minLength={2}
                maxLength={100}
                onChange={setClinicName}
              />
              <AuthTextField
                label="Responsavel"
                placeholder="Nome completo"
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

          {error && (
            <InlineFeedback>{error}</InlineFeedback>
          )}

          <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processando...'
              : isLogin
                ? 'Entrar no ambiente de teste'
                : 'Criar acesso sem cartao'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        {isLogin ? 'Ainda nao tem acesso?' : 'Ja tem acesso criado?'}{' '}
        <Link
          to="/acessar"
          search={{ mode: isLogin ? 'register' : 'login' }}
          className="font-semibold text-primary hover:underline"
        >
          {isLogin ? 'Criar teste gratis' : 'Entrar com minha conta'}
        </Link>
      </p>
    </div>
  )
}
