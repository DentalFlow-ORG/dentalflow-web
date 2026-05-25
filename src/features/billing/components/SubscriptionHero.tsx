import { CheckCircle2 } from 'lucide-react'

const TRUST_CHIPS = [
  '7 dias grátis',
  'Sem cartão de crédito',
  'Cancele quando quiser',
  'Suporte na implantação',
] as const

export function SubscriptionHero() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Planos e cobrança
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Escolha o plano ideal para a sua clínica
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Centralize agenda, pacientes e financeiro em um só lugar. Comece com 7 dias grátis — sem
          cartão, sem compromisso.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRUST_CHIPS.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
