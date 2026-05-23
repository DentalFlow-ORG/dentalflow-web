export type CommercialPlanKey = 'starter' | 'professional' | 'premium'
export type PlanFeatureAvailability = 'included' | 'not_included' | 'soon'
export type CommercialFeatureAudience = 'public' | 'admin' | 'internal'

export type CommercialFeatureCategory =
  | 'agenda'
  | 'patients'
  | 'finance'
  | 'inventory'
  | 'fiscal'
  | 'team'
  | 'intelligence'
  | 'communication'
  | 'security'
  | 'support'

export type CommercialFeature = {
  id: string
  title: string
  category: CommercialFeatureCategory
  description: string
  clientFriendlyExplanation?: string
  audience: CommercialFeatureAudience
  availability: Record<CommercialPlanKey, PlanFeatureAvailability>
}

export type PlanCardFeature = {
  label: string
  availability: PlanFeatureAvailability
}

export const COMMERCIAL_PLAN_LABELS: Record<CommercialPlanKey, string> = {
  starter: 'Starter',
  professional: 'Professional',
  premium: 'Premium',
}

export const PLAN_ORDER: CommercialPlanKey[] = ['starter', 'professional', 'premium']

export const FEATURE_CATEGORY_LABELS: Record<CommercialFeatureCategory, string> = {
  agenda: 'Agenda e atendimento',
  patients: 'Pacientes, prontuários e leads',
  finance: 'Gestão financeira',
  inventory: 'Estoque',
  fiscal: 'Fiscal e notas',
  team: 'Equipe e permissões',
  intelligence: 'Inteligência e relatórios',
  communication: 'Comunicação e notificações',
  security: 'Segurança e LGPD',
  support: 'Suporte e operação',
}

export const FEATURE_CATEGORY_ORDER: CommercialFeatureCategory[] = [
  'agenda',
  'patients',
  'finance',
  'inventory',
  'fiscal',
  'team',
  'intelligence',
  'communication',
  'security',
  'support',
]

const allPlansIncluded: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'included',
  professional: 'included',
  premium: 'included',
}

const professionalAndPremium: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'not_included',
  professional: 'included',
  premium: 'included',
}

const premiumIncluded: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'not_included',
  professional: 'not_included',
  premium: 'included',
}

const aiAvailability: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'not_included',
  professional: 'included',
  premium: 'included',
}

const premiumSoon: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'not_included',
  professional: 'not_included',
  premium: 'soon',
}

const whatsappAvailability: Record<CommercialPlanKey, PlanFeatureAvailability> = {
  starter: 'not_included',
  professional: 'soon',
  premium: 'soon',
}

export const commercialFeatures: CommercialFeature[] = [
  {
    id: 'clinic-agenda',
    title: 'Agenda da clínica',
    category: 'agenda',
    description: 'Organize consultas, horários e status de atendimento.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'dentist-schedule',
    title: 'Minha agenda para dentistas',
    category: 'agenda',
    description: 'Cada profissional acompanha sua própria rotina de atendimentos.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'google-calendar',
    title: 'Integração com Google Calendar',
    category: 'agenda',
    description: 'Sincronize a agenda da clínica com o Google Calendar.',
    clientFriendlyExplanation:
      'Requer conta Google e configuração pelo proprietário da clínica.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'patients-register',
    title: 'Cadastro de pacientes',
    category: 'patients',
    description: 'Centralize dados cadastrais e histórico de relacionamento.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'clinical-records',
    title: 'Prontuários digitais',
    category: 'patients',
    description: 'Registre evoluções clínicas e acompanhe o histórico do paciente.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'basic-clinical-templates',
    title: 'Modelos clínicos reutilizáveis',
    category: 'patients',
    description: 'Use modelos para agilizar registros recorrentes no prontuário.',
    clientFriendlyExplanation:
      'Modelos clínicos são estruturas prontas para reduzir repetição e padronizar registros.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'crm-leads',
    title: 'CRM de leads',
    category: 'patients',
    description: 'Organize e acompanhe potenciais pacientes desde o primeiro contato até a conversão.',
    clientFriendlyExplanation:
      'Limite mensal de novos leads por plano: Starter até 30, Professional até 150, Premium sem limite.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'clinic-finance',
    title: 'Gestão financeira da clínica',
    category: 'finance',
    description: 'Acompanhe receitas, despesas, categorias e despesas fixas.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'inventory-control',
    title: 'Controle de estoque',
    category: 'inventory',
    description: 'Acompanhe produtos, categorias, movimentações e reposição.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'internal-fiscal-control',
    title: 'Controle interno de notas e dados fiscais',
    category: 'fiscal',
    description: 'Organize dados fiscais, rascunhos e acompanhamento interno.',
    clientFriendlyExplanation:
      'Não promete emissão fiscal real ou automática. Emissão integrada depende de provedor, configuração e regras aplicáveis.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'team-essential',
    title: 'Equipe essencial',
    category: 'team',
    description: 'Cadastre e organize membros da equipe da clínica.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'role-permissions',
    title: 'Controle de permissões por função',
    category: 'team',
    description: 'Defina o que cada membro da equipe pode acessar.',
    clientFriendlyExplanation:
      'Permissões por função separam acessos de proprietários, dentistas e assistentes.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'operational-overview',
    title: 'Visão geral operacional',
    category: 'intelligence',
    description: 'Acompanhe indicadores básicos da rotina e da operação.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'management-reports',
    title: 'Indicadores gerenciais',
    category: 'intelligence',
    description: 'Use leituras mais completas para apoiar decisões de gestão.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'ai-assistant',
    title: 'Assistente IA para análises gerenciais',
    category: 'intelligence',
    description: 'Apoio para analisar dados financeiros e de estoque registrados no sistema.',
    clientFriendlyExplanation:
      'A IA apoia a análise. Ela não substitui decisão administrativa, contábil ou clínica. Professional inclui 1 análise por tipo por mês; Premium inclui 10.',
    audience: 'public',
    availability: aiAvailability,
  },
  {
    id: 'inventory-ai-analysis',
    title: 'Análises de estoque com apoio de IA',
    category: 'intelligence',
    description: 'Identifique pontos de atenção no estoque com base nos dados registrados.',
    clientFriendlyExplanation:
      'Recurso de apoio à análise, sem compra automática e sem decisão automática. Professional inclui 1 análise por tipo por mês; Premium inclui 10.',
    audience: 'public',
    availability: aiAvailability,
  },
  {
    id: 'whatsapp-notifications',
    title: 'WhatsApp e notificações',
    category: 'communication',
    description: 'Lembretes, confirmações e avisos operacionais enviados via WhatsApp para os pacientes.',
    clientFriendlyExplanation:
      'Requer conta Business aprovada pela Meta e configuração de templates. Professional inclui até 50 mensagens/mês; Premium inclui até 300. Starter não inclui envio via WhatsApp.',
    audience: 'public',
    availability: whatsappAvailability,
  },
  {
    id: 'audit-records',
    title: 'Registro de ações importantes',
    category: 'security',
    description: 'Acompanhe eventos relevantes para aumentar rastreabilidade.',
    clientFriendlyExplanation:
      'Recurso em evolução para clientes. Hoje a auditoria aparece principalmente na administração da plataforma.',
    audience: 'public',
    availability: premiumSoon,
  },
  {
    id: 'lgpd-organization',
    title: 'Organização de dados e políticas de privacidade',
    category: 'security',
    description: 'Apoio para organizar informações, consentimentos e direitos do titular.',
    clientFriendlyExplanation:
      'LGPD é a lei brasileira de proteção de dados. O DentalFlow ajuda na organização, sem prometer blindagem jurídica.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'subscription-management',
    title: 'Gestão da assinatura da clínica',
    category: 'support',
    description: 'O proprietário acompanha plano, teste e cobrança em uma área própria.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'priority-support',
    title: 'Suporte prioritário',
    category: 'support',
    description: 'Atendimento priorizado para clínicas com maior volume operacional.',
    audience: 'public',
    availability: premiumIncluded,
  },
  {
    id: 'saas-admin-finance',
    title: 'Financeiro SaaS da plataforma',
    category: 'finance',
    description: 'Visão administrativa interna para assinaturas, planos e eventos financeiros.',
    clientFriendlyExplanation:
      'Recurso interno da administração do DentalFlow. Não é vendido como módulo da clínica.',
    audience: 'admin',
    availability: {
      starter: 'not_included',
      professional: 'not_included',
      premium: 'not_included',
    },
  },
]

// ── Card feature configuration ─────────────────────────────────────────────────

type CardFeatureEntry = string | { id: string; label: string }

const PLAN_CARD_FEATURES: Record<
  CommercialPlanKey,
  { sectionLabel?: string; features: CardFeatureEntry[]; upgradeHints?: string[] }
> = {
  starter: {
    features: [
      'clinic-agenda',
      'clinical-records',
      'patients-register',
      'crm-leads',
      'team-essential',
    ],
    upgradeHints: ['Gestão financeira completa', 'Relatórios gerenciais'],
  },
  professional: {
    sectionLabel: 'Tudo do Starter, mais:',
    features: [
      'clinic-finance',
      'inventory-control',
      'management-reports',
      'google-calendar',
      'role-permissions',
      { id: 'ai-assistant', label: 'Assistente IA (1 análise/tipo/mês)' },
      'whatsapp-notifications',
    ],
  },
  premium: {
    sectionLabel: 'Tudo do Professional, mais:',
    features: [
      { id: 'crm-leads', label: 'CRM ilimitado — sem limite de leads' },
      { id: 'ai-assistant', label: 'IA ampliada — 10 análises/tipo/mês' },
      { id: 'inventory-ai-analysis', label: 'Análises de estoque com IA' },
      'priority-support',
      'whatsapp-notifications',
      'audit-records',
    ],
  },
}

// ── Public utilities ───────────────────────────────────────────────────────────

export function getPublicCommercialFeatures() {
  return commercialFeatures.filter((feature) => feature.audience === 'public')
}

export function getFeaturesByCategory() {
  const publicFeatures = getPublicCommercialFeatures()
  return FEATURE_CATEGORY_ORDER.map((category) => ({
    category,
    label: FEATURE_CATEGORY_LABELS[category],
    features: publicFeatures.filter((feature) => feature.category === category),
  })).filter((group) => group.features.length > 0)
}

export function getFeatureAvailability(
  feature: CommercialFeature,
  plan: CommercialPlanKey,
) {
  return feature.availability[plan]
}

export function getPlanCardFeatures(planKey: CommercialPlanKey): {
  sectionLabel?: string
  features: PlanCardFeature[]
  upgradeHints: PlanCardFeature[]
} {
  const publicFeatures = getPublicCommercialFeatures()
  const cardConfig = PLAN_CARD_FEATURES[planKey]

  const features: PlanCardFeature[] = cardConfig.features
    .map((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id
      const labelOverride = typeof entry === 'string' ? undefined : entry.label
      const feature = publicFeatures.find((f) => f.id === id)
      if (!feature) return null
      return {
        label: labelOverride ?? feature.title,
        availability: getFeatureAvailability(feature, planKey),
      }
    })
    .filter((f): f is PlanCardFeature => f != null)

  const upgradeHints: PlanCardFeature[] = (cardConfig.upgradeHints ?? []).map((label) => ({
    label,
    availability: 'not_included' as const,
  }))

  return { sectionLabel: cardConfig.sectionLabel, features, upgradeHints }
}

export function getPlanFeatureSummaries(planKey: string, limit = 7) {
  const normalizedPlan = planKey.toLowerCase() as CommercialPlanKey
  if (!PLAN_ORDER.includes(normalizedPlan)) return []

  const publicFeatures = getPublicCommercialFeatures()
  const cardConfig = PLAN_CARD_FEATURES[normalizedPlan]

  return cardConfig.features
    .map((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id
      const labelOverride = typeof entry === 'string' ? undefined : entry.label
      const feature = publicFeatures.find((f) => f.id === id)
      if (!feature) return null
      const availability = getFeatureAvailability(feature, normalizedPlan)
      if (availability === 'not_included') return null
      const label = labelOverride ?? feature.title
      return availability === 'soon' ? `${label} (em breve)` : label
    })
    .filter((label): label is string => label != null)
    .slice(0, limit)
}
