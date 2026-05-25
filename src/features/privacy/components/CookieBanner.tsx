import { ArrowRight, Cookie } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCookieConsent } from './CookieConsentContext'

export function CookieBanner() {
  const { acceptAll, rejectOptional, openPreferences } = useCookieConsent()

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 print:hidden"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xl shadow-slate-950/[0.08] sm:flex sm:items-center sm:gap-8 sm:px-6 sm:py-5">

        {/* Icon + copy */}
        <div className="flex items-start gap-3.5 sm:min-w-0 sm:flex-1">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50"
            aria-hidden="true"
          >
            <Cookie className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Usamos cookies para melhorar sua experiência
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu
              consentimento, cookies adicionais para entender o uso e melhorar nossos
              serviços.{' '}
              <a
                href="/politica-de-cookies"
                className="text-emerald-600 underline underline-offset-2 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              >
                Saiba mais
              </a>
              .
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 sm:mt-0 sm:shrink-0">
          {/* Desktop: single row */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={rejectOptional}
              aria-label="Recusar cookies opcionais"
              className="text-xs font-medium text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:rounded"
            >
              Recusar opcionais
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={openPreferences}
              aria-label="Personalizar preferências de cookies"
              className="h-8 border-slate-200 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Personalizar
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              aria-label="Aceitar todos os cookies"
              className="h-8 gap-1.5 text-xs"
            >
              Aceitar todos
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile: two-row layout */}
          <div className="flex flex-col gap-2 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openPreferences}
                aria-label="Personalizar preferências de cookies"
                className="border-slate-200 text-xs text-slate-600"
              >
                Personalizar
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                aria-label="Aceitar todos os cookies"
                className="gap-1.5 text-xs"
              >
                Aceitar todos
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={rejectOptional}
                aria-label="Recusar cookies opcionais"
                className="text-xs font-medium text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:rounded"
              >
                Recusar opcionais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
