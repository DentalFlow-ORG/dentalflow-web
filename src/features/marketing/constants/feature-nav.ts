import {
  Bot,
  CalendarDays,
  ClipboardList,
  CreditCard,
  TrendingUp,
  Users,
} from 'lucide-react'

export type FeatureNavItem = {
  id: string
  label: string
  href: string
  icon: typeof CalendarDays
}

export const MAIN_FEATURES: FeatureNavItem[] = [
  {
    id: 'agenda',
    label: 'Agenda inteligente',
    href: '/funcionalidades/agenda',
    icon: CalendarDays,
  },
  {
    id: 'prontuarios',
    label: 'Prontuário eletrônico',
    href: '/funcionalidades/prontuarios',
    icon: ClipboardList,
  },
  {
    id: 'financeiro',
    label: 'Gestão financeira',
    href: '/funcionalidades/financeiro',
    icon: CreditCard,
  },
  {
    id: 'pacientes',
    label: 'Pacientes e leads',
    href: '/funcionalidades/pacientes',
    icon: Users,
  },
  {
    id: 'relatorios',
    label: 'Relatórios e indicadores',
    href: '/funcionalidades/relatorios',
    icon: TrendingUp,
  },
  { id: 'ia', label: 'IA de gestão', href: '/funcionalidades/ia', icon: Bot },
]

/** Maps role label strings (from FeatureDetailContent.roles[].role) to public role pages. */
export const ROLE_ROUTES: Record<string, string> = {
  'Secretária / Recepção': '/para-secretarias',
  'Dentista': '/para-dentistas',
  'Gestor / Proprietário': '/para-gestores',
  'Gestor/Proprietário': '/para-gestores',
}
