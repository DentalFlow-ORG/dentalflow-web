import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { forgotPassword } from '../services/auth.service'
import { AuthHeader } from '../components/AuthHeader'

export function ForgotPasswordPage() {
  useForceLightTheme()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await forgotPassword(email.trim().toLowerCase())
      setSubmitted(true)
    } catch {
      setError('Não foi possível processar a solicitação. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
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
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-slate-950">Recuperar senha</h1>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Informe seu e-mail e enviaremos um link para redefinir a senha.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="mt-7 space-y-5">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Se este e-mail estiver cadastrado, você receberá as instruções em instantes.
                Verifique também sua pasta de spam.
              </div>
              <Link
                to="/acessar"
                search={{ mode: 'login' }}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">
                  E-mail profissional
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@clinica.com.br"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && <InlineFeedback>{error}</InlineFeedback>}

              <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar instruções
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/acessar"
                  search={{ mode: 'login' }}
                  className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </section>
  )
}
