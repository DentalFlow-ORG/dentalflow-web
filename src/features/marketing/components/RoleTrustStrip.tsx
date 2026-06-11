import { CheckCircle2 } from 'lucide-react'

const SIGNALS = [
  '7 dias de teste grátis',
  'Sem cartão de crédito',
  'Cancele quando quiser',
  '9 módulos integrados',
  '100% web',
] as const

export function RoleTrustStrip() {
  return (
    <div className="border-y border-slate-100 bg-white py-5">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          role="list"
          aria-label="Diferenciais da plataforma"
        >
          {SIGNALS.map((signal, index) => (
            <span
              key={signal}
              className="flex items-center gap-1.5 text-sm text-slate-500"
              role="listitem"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {signal}
              {index < SIGNALS.length - 1 && (
                <span
                  className="ml-3 hidden h-3.5 w-px bg-slate-200 sm:inline-block"
                  aria-hidden="true"
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
