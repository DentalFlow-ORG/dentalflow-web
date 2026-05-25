import { useEffect, useState } from 'react'
import { Cookie, Lock, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useCookieConsent } from './CookieConsentContext'
import type { CookieConsent } from '../types/cookie-consent.types'

type OptionalCategories = Omit<CookieConsent['categories'], 'necessary'>

// ── Category card ─────────────────────────────────────────────────────────────

type CategoryCardProps = {
  title: string
  description: string
  required?: boolean
  enabled: boolean
  onChange?: (val: boolean) => void
}

function CategoryCard({ title, description, required, enabled, onChange }: CategoryCardProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border p-4',
        required
          ? 'border-slate-200 bg-slate-50/60 dark:border-border dark:bg-muted/20'
          : 'border-slate-200 bg-white dark:border-border dark:bg-accent/30',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-foreground">{title}</p>
          {required && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <Lock className="h-2.5 w-2.5" aria-hidden="true" />
              Sempre ativo
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-muted-foreground">{description}</p>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={required}
        onClick={() => onChange?.(!enabled)}
        aria-label={
          required
            ? `Cookies ${title.toLowerCase()} são sempre necessários`
            : `${enabled ? 'Desativar' : 'Ativar'} cookies ${title.toLowerCase()}`
        }
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2',
          required && 'cursor-not-allowed opacity-50',
          enabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-muted',
        )}
      >
        <span
          className={cn(
            'h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
            enabled ? 'translate-x-[22px]' : 'translate-x-[3px]',
          )}
        />
      </button>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

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

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreferences()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closePreferences])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closePreferences}
      />

      {/* Dialog panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl shadow-slate-950/20 dark:bg-popover dark:shadow-black/40 dark:border dark:border-border">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-border px-6 py-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50"
            aria-hidden="true"
          >
            <Cookie className="h-5 w-5 text-emerald-600" />
          </div>
          <h2
            id="cookie-prefs-title"
            className="flex-1 text-base font-semibold text-slate-900 dark:text-foreground"
          >
            Preferências de cookies
          </h2>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Fechar preferências de cookies"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          <p className="text-sm leading-6 text-slate-500 dark:text-muted-foreground">
            Gerencie como o DentalFlow pode utilizar cookies além dos necessários para
            o funcionamento da plataforma.{' '}
            <a
              href="/politica-de-cookies"
              className="text-emerald-600 underline underline-offset-2 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              Saiba mais
            </a>
            .
          </p>

          <div className="mt-5 space-y-2.5">
            <CategoryCard
              title="Necessários"
              description="Autenticação, segurança e funcionamento essencial da plataforma. Não podem ser desativados."
              required
              enabled
            />
            <CategoryCard
              title="Preferências"
              description="Lembrar configurações de exibição e personalização da interface."
              enabled={prefs.preferences}
              onChange={() => toggle('preferences')}
            />
            <CategoryCard
              title="Análise"
              description="Dados de uso agregados e anonimizados para melhorar o desempenho e a experiência da plataforma."
              enabled={prefs.analytics}
              onChange={() => toggle('analytics')}
            />
            <CategoryCard
              title="Marketing"
              description="Podem ser usados para personalizar comunicações e campanhas relacionadas ao DentalFlow. Atualmente não utilizado."
              enabled={prefs.marketing}
              onChange={() => toggle('marketing')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-border px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { rejectOptional(); closePreferences() }}
            className="text-slate-500 hover:text-slate-700"
          >
            Recusar opcionais
          </Button>
          <div className="flex flex-1 flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { acceptAll(); closePreferences() }}
              className="border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Aceitar todos
            </Button>
            <Button
              size="sm"
              onClick={() => savePreferences(prefs)}
            >
              Salvar preferências
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
