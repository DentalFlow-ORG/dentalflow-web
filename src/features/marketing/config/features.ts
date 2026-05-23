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

export const COMMERCIAL_PLAN_LABELS: Record<CommercialPlanKey, string> = {
  starter: 'Starter',
  professional: 'Professional',
  premium: 'Premium',
}

export const PLAN_ORDER: CommercialPlanKey[] = ['starter', 'professional', 'premium']

export const FEATURE_CATEGORY_LABELS: Record<CommercialFeatureCategory, string> = {
  agenda: 'Agenda e atendimento',
  patients: 'Pacientes, prontuarios e leads',
  finance: 'Gestao financeira',
  inventory: 'Estoque',
  fiscal: 'Fiscal e notas',
  team: 'Equipe e permissoes',
  intelligence: 'Inteligencia e relatorios',
  communication: 'Comunicacao e notificacoes',
  security: 'Seguranca e LGPD',
  support: 'Suporte e operacao',
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

export const commercialFeatures: CommercialFeature[] = [
  {
    id: 'clinic-agenda',
    title: 'Agenda da clinica',
    category: 'agenda',
    description: 'Organize consultas, horarios e status de atendimento.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'dentist-schedule',
    title: 'Minha agenda para dentistas',
    category: 'agenda',
    description: 'Cada profissional acompanha sua propria rotina de atendimentos.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'patients-register',
    title: 'Cadastro de pacientes',
    category: 'patients',
    description: 'Centralize dados cadastrais e historico de relacionamento.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'clinical-records',
    title: 'Prontuarios digitais',
    category: 'patients',
    description: 'Registre evolucoes clinicas e acompanhe o historico do paciente.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'basic-clinical-templates',
    title: 'Modelos clinicos reutilizaveis',
    category: 'patients',
    description: 'Use modelos para agilizar registros recorrentes no prontuario.',
    clientFriendlyExplanation:
      'Modelos clinicos sao estruturas prontas para reduzir repeticao e padronizar registros.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'crm-leads',
    title: 'CRM de leads',
    category: 'patients',
    description: 'Organize e acompanhe potenciais pacientes desde o primeiro contato ate a conversao.',
    clientFriendlyExplanation:
      'Limite mensal de novos leads por plano: Starter ate 30, Professional ate 150, Premium sem limite.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'clinic-finance',
    title: 'Gestao financeira da clinica',
    category: 'finance',
    description: 'Acompanhe receitas, despesas, categorias e despesas fixas.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'inventory-control',
    title: 'Controle de estoque',
    category: 'inventory',
    description: 'Acompanhe produtos, categorias, movimentacoes e reposicao.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'internal-fiscal-control',
    title: 'Controle interno de notas e dados fiscais',
    category: 'fiscal',
    description: 'Organize dados fiscais, rascunhos e acompanhamento interno.',
    clientFriendlyExplanation:
      'Nao promete emissao fiscal real ou automatica. Emissao integrada depende de provedor, configuracao e regras aplicaveis.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'google-calendar',
    title: 'Integracao com Google Calendar',
    category: 'agenda',
    description: 'Sincronize a agenda da clinica com o Google Calendar.',
    clientFriendlyExplanation:
      'Requer conta Google e configuracao pelo proprietario da clinica.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'team-essential',
    title: 'Equipe essencial',
    category: 'team',
    description: 'Cadastre e organize membros da equipe da clinica.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'role-permissions',
    title: 'Controle de permissoes por funcao',
    category: 'team',
    description: 'Defina o que cada membro da equipe pode acessar.',
    clientFriendlyExplanation:
      'Permissoes por funcao separam acessos de proprietarios, dentistas e assistentes.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'operational-overview',
    title: 'Visao geral operacional',
    category: 'intelligence',
    description: 'Acompanhe indicadores basicos da rotina e da operacao.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'management-reports',
    title: 'Indicadores gerenciais',
    category: 'intelligence',
    description: 'Use leituras mais completas para apoiar decisoes de gestao.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'ai-assistant',
    title: 'Assistente IA para analises gerenciais',
    category: 'intelligence',
    description: 'Apoio para analisar dados financeiros e de estoque registrados no sistema.',
    clientFriendlyExplanation:
      'A IA apoia a analise. Ela nao substitui decisao administrativa, contabil ou clinica. Professional inclui 1 analise por tipo por mes; Premium inclui 10.',
    audience: 'public',
    availability: aiAvailability,
  },
  {
    id: 'inventory-ai-analysis',
    title: 'Analises de estoque com apoio de IA',
    category: 'intelligence',
    description: 'Identifique pontos de atencao no estoque com base nos dados registrados.',
    clientFriendlyExplanation:
      'Recurso de apoio a analise, sem compra automatica e sem decisao automatica. Professional inclui 1 analise por tipo por mes; Premium inclui 10.',
    audience: 'public',
    availability: aiAvailability,
  },
  {
    id: 'whatsapp-notifications',
    title: 'WhatsApp e notificacoes',
    category: 'communication',
    description: 'Lembretes, confirmacoes e avisos operacionais enviados via WhatsApp para os pacientes.',
    clientFriendlyExplanation:
      'Requer conta Business aprovada pela Meta e configuracao de templates. Professional inclui ate 50 mensagens/mes; Premium inclui ate 300. Starter nao inclui envio via WhatsApp.',
    audience: 'public',
    availability: professionalAndPremium,
  },
  {
    id: 'audit-records',
    title: 'Registro de acoes importantes',
    category: 'security',
    description: 'Acompanhe eventos relevantes para aumentar rastreabilidade.',
    clientFriendlyExplanation:
      'Recurso em evolucao para clientes. Hoje a auditoria aparece principalmente na administracao da plataforma.',
    audience: 'public',
    availability: premiumSoon,
  },
  {
    id: 'lgpd-organization',
    title: 'Organizacao de dados e politicas de privacidade',
    category: 'security',
    description: 'Apoio para organizar informacoes, consentimentos e direitos do titular.',
    clientFriendlyExplanation:
      'LGPD e a lei brasileira de protecao de dados. O DentalFlow ajuda na organizacao, sem prometer blindagem juridica.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'subscription-management',
    title: 'Gestao da assinatura da clinica',
    category: 'support',
    description: 'O proprietario acompanha plano, teste e cobranca em uma area propria.',
    audience: 'public',
    availability: allPlansIncluded,
  },
  {
    id: 'priority-support',
    title: 'Suporte prioritario',
    category: 'support',
    description: 'Atendimento priorizado para clinicas com maior volume operacional.',
    audience: 'public',
    availability: premiumIncluded,
  },
  {
    id: 'saas-admin-finance',
    title: 'Financeiro SaaS da plataforma',
    category: 'finance',
    description: 'Visao administrativa interna para assinaturas, planos e eventos financeiros.',
    clientFriendlyExplanation:
      'Recurso interno da administracao do DentalFlow. Nao e vendido como modulo da clinica.',
    audience: 'admin',
    availability: {
      starter: 'not_included',
      professional: 'not_included',
      premium: 'not_included',
    },
  },
]

const PLAN_CARD_FEATURE_IDS: Record<CommercialPlanKey, string[]> = {
  starter: [
    'clinic-agenda',
    'patients-register',
    'clinical-records',
    'basic-clinical-templates',
    'crm-leads',
    'lgpd-organization',
  ],
  professional: [
    'clinic-finance',
    'inventory-control',
    'internal-fiscal-control',
    'management-reports',
    'whatsapp-notifications',
    'google-calendar',
    'ai-assistant',
  ],
  premium: [
    'ai-assistant',
    'inventory-ai-analysis',
    'whatsapp-notifications',
    'management-reports',
    'audit-records',
    'priority-support',
  ],
}

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

export function getPlanFeatureSummaries(planKey: string, limit = 7) {
  const normalizedPlan = planKey.toLowerCase() as CommercialPlanKey
  if (!PLAN_ORDER.includes(normalizedPlan)) return []

  const featureIds = PLAN_CARD_FEATURE_IDS[normalizedPlan]
  return featureIds
    .map((id) => getPublicCommercialFeatures().find((feature) => feature.id === id))
    .filter((feature): feature is CommercialFeature => feature != null)
    .filter((feature) => {
      const availability = getFeatureAvailability(feature, normalizedPlan)
      return availability === 'included' || availability === 'soon'
    })
    .slice(0, limit)
    .map((feature) => {
      const availability = getFeatureAvailability(feature, normalizedPlan)
      return availability === 'soon' ? `${feature.title} (em breve)` : feature.title
    })
}
