import type { NormalizedBillingStatus } from '@/features/billing/types/billing.types'

export const ROLE_INFO = [
  {
    label: 'Proprietário',
    description: 'Acesso completo: configurações, financeiro, equipe e faturamento.',
  },
  {
    label: 'Dentista',
    description: 'Agenda própria, prontuários e análise clínica de pacientes.',
  },
  {
    label: 'Assistente',
    description: 'Agendamentos, pacientes, estoque e notas fiscais.',
  },
]

export const STATUS_INFO: Record<
  NormalizedBillingStatus,
  { label: string; tone: 'success' | 'muted' | 'warning' }
> = {
  active: { label: 'Ativo', tone: 'success' },
  trialing: { label: 'Teste grátis', tone: 'warning' },
  past_due: { label: 'Pagamento atrasado', tone: 'warning' },
  canceled: { label: 'Cancelado', tone: 'muted' },
  incomplete: { label: 'Incompleto', tone: 'muted' },
  unpaid: { label: 'Não pago', tone: 'warning' },
  paused: { label: 'Pausado', tone: 'muted' },
  missing: { label: 'Sem plano', tone: 'muted' },
}
