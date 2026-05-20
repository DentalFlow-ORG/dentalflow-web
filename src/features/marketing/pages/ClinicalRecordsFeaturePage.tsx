import { usePageMeta } from '../hooks/usePageMeta'
import { featureDetailContents } from '../data/public-content'
import { FeatureDetailPage } from './FeatureDetailPage'

export function ClinicalRecordsFeaturePage() {
  usePageMeta(
    'DentalFlow | Prontuários digitais para clínicas odontológicas',
    'Registre evoluções clínicas e consulte o histórico completo de cada paciente. Prontuários digitais organizados, sem papel.',
  )
  return <FeatureDetailPage content={featureDetailContents.prontuarios} />
}
