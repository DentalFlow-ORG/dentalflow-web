import { Check, Lock, ShieldCheck } from 'lucide-react'

import { commercialFeatures, type CommercialPlanKey, type PlanCardFeature } from '@/features/marketing/config/features'

export const COMPARISON_FEATURE_IDS = [
  'clinic-agenda',
  'clinical-records',
  'patients-register',
  'crm-leads',
  'clinic-finance',
  'inventory-control',
  'management-reports',
  'google-calendar',
  'role-permissions',
  'ai-assistant',
  'whatsapp-notifications',
  'priority-support',
] as const

export const REASSURANCE_ITEMS = [
  { icon: Check, text: 'Teste grátis por 7 dias, sem cartão de crédito' },
  { icon: Check, text: 'Cancele quando quiser, sem fidelidade' },
  { icon: ShieldCheck, text: 'Pagamentos processados com segurança via Stripe' },
  { icon: Lock, text: 'Migração assistida pela nossa equipe no início' },
]

export function getComparisonFeatures(planKey: CommercialPlanKey): PlanCardFeature[] {
  return COMPARISON_FEATURE_IDS.map((id) => {
    const feature = commercialFeatures.find((f) => f.id === id)
    if (!feature) return null
    return { label: feature.title, availability: feature.availability[planKey] }
  }).filter((f): f is PlanCardFeature => f !== null)
}
