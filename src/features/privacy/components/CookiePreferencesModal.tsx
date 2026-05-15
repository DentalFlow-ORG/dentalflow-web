import { useState } from 'react'
import { X, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCookieConsent } from './CookieConsentContext'
import type { CookieConsent } from '../types/cookie-consent.types'

type OptionalCategories = Omit<CookieConsent['categories'], 'necessary'>

type CategoryRowProps = {
  title: string
  description: string
  required?: boolean
  enabled: boolean
  onChange?: (val: boolean) => void
}

function CategoryRow({ title, description, required, enabled, onChange }: CategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{title}</p>
          {required && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              <Lock className="h-3 w-3" />
              Sempre ativo
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500 leading-5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={required}
        onClick={() => onChange?.(!enabled)}
        className={[
          'relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          required ? 'cursor-not-allowed opacity-60' : '',
          enabled ? 'bg-primary' : 'bg-slate-200',
        ].join(' ')}
        aria-label={`${enabled ? 'Desativar' : 'Ativar'} cookies ${title.toLowerCase()}`}
      >
        <span
          className={[
            'h-4 w-4 rounded-full bg-white shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function CookiePreferencesModal() {
  const { consent, savePreferences, acceptAll, rejectOptional, closePreferences } =
    useCookieConsent()

  const [prefs, setPrefs] = useState<OptionalCategories>({
    preferences: consent?.categories.preferences ?? false,
    analytics: consent?.categories.analytics ?? false,
    marketing: consent?.categories.marketing ?? false,
  })

  const toggle = (key: keyof OptionalCategories) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closePreferences}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="cookie-prefs-title" className="text-lg font-semibold text-slate-900">
            Preferências de cookies
          </h2>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Fechar preferências de cookies"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <p className="mb-5 text-sm text-slate-500">
            Gerencie suas preferências. Cookies necessários garantem o funcionamento
            básico e não podem ser desativados.{' '}
            <a href="/politica-de-cookies" className="text-primary underline">
              Saiba mais
            </a>
            .
          </p>

          <div className="space-y-3">
            <CategoryRow
              title="Necessários"
              description="Autenticação, segurança e funcionamento essencial da plataforma."
              required
              enabled
            />
            <CategoryRow
              title="Preferências"
              description="Lembrar configurações de exibição e personalização da interface."
              enabled={prefs.preferences}
              onChange={() => toggle('preferences')}
            />
            <CategoryRow
              title="Analytics"
              description="Dados de uso agregados e anonimizados para melhorar a plataforma."
              enabled={prefs.analytics}
              onChange={() => toggle('analytics')}
            />
            <CategoryRow
              title="Marketing"
              description="Comunicações personalizadas e medição de campanhas. Atualmente não utilizado."
              enabled={prefs.marketing}
              onChange={() => toggle('marketing')}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={rejectOptional}
            className="flex-1 sm:flex-none"
          >
            Recusar opcionais
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={acceptAll}
            className="flex-1 sm:flex-none"
          >
            Aceitar todos
          </Button>
          <Button
            size="sm"
            onClick={() => savePreferences(prefs)}
            className="flex-1 sm:flex-none sm:ml-auto"
          >
            Salvar preferências
          </Button>
        </div>
      </div>
    </div>
  )
}
