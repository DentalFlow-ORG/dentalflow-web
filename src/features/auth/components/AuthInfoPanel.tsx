import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'

import { companyInfo } from '@/config/company'

const trustPoints = [
  {
    icon: CalendarCheck2,
    title: 'Rotina centralizada',
    description: 'Agenda, equipe e pacientes entram no mesmo fluxo operacional.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso protegido',
    description: 'Sessões e permissões continuam validadas pelo backend.',
  },
  {
    icon: ClipboardList,
    title: 'Dados consistentes',
    description: 'Cadastro e clínica são vinculados antes do acesso ao app.',
  },
] as const

export function AuthInfoPanel() {
  return (
    <aside className="relative overflow-hidden rounded-lg border border-primary/15 bg-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-8 lg:min-h-[640px]">
      <div className="absolute inset-x-0 top-0 h-40 bg-white/10" aria-hidden="true" />
      <div className="relative flex h-full flex-col">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
          <Sparkles className="h-4 w-4" />
          Acesso DentalFlow
        </div>

        <div className="mt-10 max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Sua clínica no flow, seu crescimento é show.
          </h1>
          <p className="mt-5 text-base leading-8 text-white/75 sm:text-lg">
            Entre para operar a agenda, a presença digital e os dados da clínica em um
            ambiente limpo, seguro e orientado ao crescimento.
          </p>
        </div>

        <div className="mt-10 grid gap-3">
          {trustPoints.map((item) => (
            <div
              key={item.title}
              className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/70">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-10">
          <div className="rounded-md border border-white/15 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-100">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pensado para clínicas</p>
                <p className="mt-1 text-sm text-white/65">
                  Sem promessas infladas, sem atalhos de segurança.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-white/75">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
              {companyInfo.brandSlogan}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
