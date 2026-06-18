import {
  BarChart3,
  Bot,
  Boxes,
  CalendarDays,
  ClipboardList,
  CreditCard,
  type LucideIcon,
  MessageCircle,
  Users,
  UsersRound,
} from 'lucide-react'

export type DentalWorkflow = {
  key: string
  /** Short label shown on chips, labels and the detail panel. */
  label: string
  /** Dental-specific one-liner shown in the detail panel. */
  description: string
  icon: LucideIcon
  /** Premium accent (cyan/blue dominant, restrained emerald) used by the 3D
   * teeth, the static arch and the selector chips. */
  accent: string
}

/**
 * The nine clinic workflows mapped onto the dental arch. Shared by the WebGL
 * scene, the static SVG fallback and the accessible chip selector so the three
 * never drift. Ordered to read naturally along the arch (right molar → left
 * molar), front-of-mouth workflows toward the center.
 */
export const DENTAL_WORKFLOWS: DentalWorkflow[] = [
  {
    key: 'relatorios',
    label: 'Relatórios',
    description:
      'Indicadores de produção, ocupação e faturamento para decidir com dados, não no achismo.',
    icon: BarChart3,
    accent: '#3b82f6',
  },
  {
    key: 'estoque',
    label: 'Estoque',
    description:
      'Materiais de consumo e instrumentais controlados sem depender da memória da equipe.',
    icon: Boxes,
    accent: '#2dd4bf',
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    description: 'Receitas, despesas e fluxo de caixa da clínica acompanhados em tempo real.',
    icon: CreditCard,
    accent: '#34d399',
  },
  {
    key: 'agenda',
    label: 'Agenda',
    description: 'Consultas, encaixes e retornos de cada cadeira em uma única visão da semana.',
    icon: CalendarDays,
    accent: '#38bdf8',
  },
  {
    key: 'prontuario',
    label: 'Prontuário',
    description: 'Evoluções clínicas, odontograma e anexos do tratamento organizados por paciente.',
    icon: ClipboardList,
    accent: '#22d3ee',
  },
  {
    key: 'pacientes',
    label: 'Pacientes',
    description: 'Cadastro, histórico clínico e contato de cada paciente sempre à mão.',
    icon: Users,
    accent: '#0ea5e9',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    description: 'Lembretes e confirmações de consulta enviados automaticamente aos pacientes.',
    icon: MessageCircle,
    accent: '#10b981',
  },
  {
    key: 'equipe',
    label: 'Equipe',
    description: 'Dentistas, recepção e gestão na mesma visão, com permissões por função.',
    icon: UsersRound,
    accent: '#818cf8',
  },
  {
    key: 'ia',
    label: 'IA de gestão',
    description:
      'Análises e alertas sobre financeiro e estoque a partir dos dados reais da clínica.',
    icon: Bot,
    accent: '#60a5fa',
  },
]
