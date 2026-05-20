import { usePageMeta } from '../hooks/usePageMeta'
import { featureDetailContents } from '../data/public-content'
import { FeatureDetailPage } from './FeatureDetailPage'

export function LeadsFeaturePage() {
  usePageMeta(
    'DentalFlow | Leads e CRM para clínicas odontológicas',
    'Organize potenciais pacientes com pipeline, status, follow-up e histórico de interações. Nenhuma oportunidade perdida.',
  )
  return <FeatureDetailPage content={featureDetailContents.leads} />
}
