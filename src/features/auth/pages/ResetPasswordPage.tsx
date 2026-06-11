import { Link, useSearch } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { AuthHeader } from '../components/AuthHeader'
import { PasswordRequirements } from '../components/PasswordRequirements'
import { resetPassword } from '../services/auth.service'

export function ResetPasswordPage() {
  useForceLightTheme()
  const { token } = useSearch({ from: '/recuperar-senha/redefinir' })
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    setIsSubmitting(true)

    try {
      await resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível redefinir a senha. Tente novamente.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <section className="relative min-h-screen overflow-x-hidden bg-slate-50 px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        {/* Decoration layer — always behind all content */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />
        </div>
        {/* Content layer — logo and card always above decoration */}
        <div className="relative z-10">
          <AuthHeader />
          <div className="relative mx-auto mt-10 w-full max-w-md">
            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-xl shadow-slate-950/10">
              <InlineFeedback>
                Link inválido ou expirado.{' '}
                <Link to="/recuperar-senha" className="font-semibold underline hover:no-underline">
                  Solicite um novo link
                </Link>
                .
              </InlineFeedback>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-slate-50 px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
      {/* Decoration layer — always behind all content */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      {/* Content layer — logo and card always above decoration */}
      <div className="relative z-10">
        <AuthHeader />

        <div className="relative mx-auto mt-10 w-full max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-xl shadow-slate-950/10">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <KeyRound className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-950">
                  {success ? 'Senha redefinida' : 'Nova senha'}
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {success
                    ? 'Sua senha foi atualizada com sucesso.'
                    : 'Escolha uma senha segura para sua conta.'}
                </p>
              </div>
            </div>

            {success ? (
              <div className="mt-7 space-y-5">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Senha redefinida com sucesso. Você já pode entrar com a nova senha.
                </div>
                <Link
                  to="/acessar"
                  search={{ mode: 'login' }}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Ir para o login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Crie uma senha segura"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <PasswordRequirements password={password} visible={passwordFocused} />
                </div>

                {error && <InlineFeedback>{error}</InlineFeedback>}

                <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Redefinir senha
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
