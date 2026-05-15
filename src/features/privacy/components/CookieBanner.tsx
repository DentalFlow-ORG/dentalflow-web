import { Cookie } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCookieConsent } from './CookieConsentContext'

export function CookieBanner() {
  const { acceptAll, rejectOptional, openPreferences } = useCookieConsent()

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-slate-600">
            Utilizamos cookies para autenticação e, com seu consentimento, para melhorar
            sua experiência. Cookies necessários não podem ser desativados.{' '}
            <a
              href="/politica-de-cookies"
              className="text-primary underline hover:opacity-80"
            >
              Saiba mais
            </a>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={openPreferences}
            aria-label="Personalizar preferências de cookies"
          >
            Personalizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={rejectOptional}
            aria-label="Recusar cookies não essenciais"
          >
            Recusar não essenciais
          </Button>
          <Button
            size="sm"
            onClick={acceptAll}
            aria-label="Aceitar todos os cookies"
          >
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  )
}
