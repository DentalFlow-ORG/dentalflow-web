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
  /** Concise, conversion-oriented explanation shown in the detail panel. */
  description: string
  /** One short value statement reinforcing the outcome for the clinic. */
  benefit: string
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
      'Transforme os dados da clínica em indicadores claros para acompanhar a evolução do negócio.',
    benefit: 'Decisões melhores, com dados.',
    icon: BarChart3,
    accent: '#3b82f6',
  },
  {
    key: 'estoque',
    label: 'Estoque',
    description:
      'Controle os materiais odontológicos e evite faltas ou desperdícios no dia a dia da clínica.',
    benefit: 'Mais eficiência operacional.',
    icon: Boxes,
    accent: '#2dd4bf',
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    description:
      'Visualize receitas, inadimplência e previsões para decidir com mais controle e segurança.',
    benefit: 'Mais previsibilidade para a clínica.',
    icon: CreditCard,
    accent: '#34d399',
  },
  {
    key: 'agenda',
    label: 'Agenda',
    description:
      'Organize consultas, confirmações e encaixes em uma agenda pensada para a rotina da odontologia.',
    benefit: 'Menos falhas, mais ocupação da cadeira.',
    icon: CalendarDays,
    accent: '#38bdf8',
  },
  {
    key: 'prontuario',
    label: 'Prontuário',
    description:
      'Tenha o histórico clínico do paciente sempre acessível, com mais segurança e organização.',
    benefit: 'Mais agilidade no atendimento.',
    icon: ClipboardList,
    accent: '#22d3ee',
  },
  {
    key: 'pacientes',
    label: 'Pacientes',
    description:
      'Centralize cadastro, histórico e relacionamento para não perder o contexto de cada atendimento.',
    benefit: 'Mais continuidade e mais retorno.',
    icon: Users,
    accent: '#0ea5e9',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    description:
      'Automatize lembretes e confirmações de consulta para reduzir faltas e melhorar a comunicação.',
    benefit: 'Mais presença e menos retrabalho.',
    icon: MessageCircle,
    accent: '#10b981',
  },
  {
    key: 'equipe',
    label: 'Equipe',
    description: 'Alinhe dentistas, recepção e gestão com a mesma visão da operação da clínica.',
    benefit: 'Mais produtividade e menos ruído.',
    icon: UsersRound,
    accent: '#818cf8',
  },
  {
    key: 'ia',
    label: 'IA de gestão',
    description:
      'Receba apoio analítico para enxergar gargalos e oportunidades da clínica com mais rapidez.',
    benefit: 'Gestão mais inteligente.',
    icon: Bot,
    accent: '#60a5fa',
  },
]
