import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

const testItems = [
  'Visao inicial de gestao comercial e indicadores.',
  'Fluxo de acesso preparado para futura integracao com API.',
  'Experiencia sem etapa de pagamento ou cartao.',
] as const

export function AuthInfoPanel() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
        <AlertCircle className="h-4 w-4" />
        Ambiente de teste da plataforma
      </div>

      <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-tight text-slate-950">
        Acesse uma demonstracao segura do DentalFlow.
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
        Esta area simula o fluxo inicial da plataforma para avaliacao. Nenhum
        cartao e solicitado e nenhuma cobranca e realizada por esta tela.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-950">
            Teste sem cartao
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            O cadastro de demonstracao nao pede dados de pagamento.
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
            Use informacoes institucionais para conhecer a experiencia.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">O que voce pode testar</h2>
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
