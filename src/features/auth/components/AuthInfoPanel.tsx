import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

const agendaItems = [
  'Organize horários, serviços e responsáveis em uma rotina única.',
  'Acompanhe solicitações de pacientes sem perder o contexto da clínica.',
  'Mantenha a experiência pública simples, segura e orientada à conversão.',
] as const

export function AuthInfoPanel() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
        <CalendarCheck2 className="h-4 w-4" />
        Acesso seguro DentalFlow
      </div>

      <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
        Entre para gerenciar a presença digital e a rotina da clínica.
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
        Uma experiência limpa para acessar o ambiente da clínica, acompanhar
        perfis profissionais e preparar os próximos fluxos de agendamento.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-950">Equipe clínica</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Profissionais, serviços e páginas públicas ficam conectados ao mesmo
            ambiente da clínica.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-950">Fluxo operacional</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            A agenda deve evoluir a partir dos dados reais da clínica, sempre
            com permissões validadas pelo backend.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">Preparado para agenda</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {agendaItems.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          As permissões são aplicadas depois da autenticação. Esta tela não
          expõe regras internas de acesso.
        </p>
      </div>
    </div>
  )
}
