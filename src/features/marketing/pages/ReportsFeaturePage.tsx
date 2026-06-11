import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function ReportsFeaturePage() {
  usePageMeta(
    'DentalFlow | Relatórios e indicadores para clínicas odontológicas',
    'Acompanhe agenda, financeiro e leads com relatórios filtrados por período. Base objetiva para decisões da clínica.',
  )
  return <FeatureDetailPage content={featureDetailContents.relatorios} />
}
