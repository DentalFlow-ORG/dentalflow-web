import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building2, LockKeyhole, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/http'

import { isValidPersonName } from '@/lib/field-formatters'

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
      const message = 'Informe nome e sobrenome do responsável.'
      setError(message)
      showAlert({
        title: 'Cadastro incompleto',
        description: message,
        tone: 'warning',
      })
      return
    }

    if (!isLogin && !isValidPersonName(normalizedResponsibleName)) {
      const message = 'O nome do responsável não pode conter números ou caracteres especiais.'
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
          description: 'A clínica foi cadastrada com sucesso.',
          tone: 'success',
        })
      }

      await navigate({ to: '/app' })
    } catch (requestError) {
      const title = isLogin
        ? 'Não foi possível entrar'
        : 'Não foi possível criar a conta'

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
        const message = 'Não foi possível autenticar agora.'
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
            {isLogin ? 'Entrar na plataforma' : 'Criar acesso da clínica'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? 'Use seu e-mail profissional para acessar o ambiente DentalFlow.'
              : 'Cadastre a clínica para iniciar o acesso da equipe.'}
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

          {error && <InlineFeedback>{error}</InlineFeedback>}

          <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processando...'
              : isLogin
                ? 'Entrar na plataforma'
                : 'Criar acesso seguro'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
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
