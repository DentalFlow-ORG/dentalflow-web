import { BarChart3, CalendarCheck2, FileText, Headphones } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'

const VALUE_ITEMS = [
  {
    icon: CalendarCheck2,
    title: 'Agenda digital',
    description: 'Confirmações automáticas e visualização clara da agenda da clínica.',
  },
  {
    icon: BarChart3,
    title: 'Financeiro organizado',
    description: 'Receitas, despesas e relatórios em um painel claro, sem planilhas.',
  },
  {
    icon: FileText,
    title: 'Prontuário digital',
    description: 'Histórico completo do paciente acessível a qualquer momento.',
  },
  {
    icon: Headphones,
    title: 'Suporte na implantação',
    description: 'Nossa equipe configura tudo com você desde o primeiro dia.',
  },
] as const

export function PlanValueSection() {
  return (
    <PanelCard className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        O que muda na sua clínica
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_ITEMS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}
