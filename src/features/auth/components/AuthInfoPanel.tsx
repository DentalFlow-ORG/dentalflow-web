import { CheckCircle2, ShieldCheck } from 'lucide-react'

const testItems = [
  'Visão inicial de gestão comercial e indicadores.',
  'Experiência sem etapa de pagamento ou cartão.',
] as const

export function AuthInfoPanel() {
  return (
    <div>
      <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-slate-950">
        Acesse uma demonstração segura do DentalFlow.
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
        Esta área simula o fluxo inicial da plataforma para avaliação. Nenhum
        cartão é solicitado e nenhuma cobrança é realizada por esta tela.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-950">
            Teste sem cartão
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            O cadastro de demonstração não pede dados de pagamento.
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-950">
            Dados protegidos
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Use informações institucionais para conhecer a experiência.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">O que você pode testar</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {testItems.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
