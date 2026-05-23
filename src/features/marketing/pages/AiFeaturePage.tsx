import { usePageMeta } from '../hooks/usePageMeta'
import { featureDetailContents } from '../data/public-content'
import { FeatureDetailPage } from './FeatureDetailPage'

export function AiFeaturePage() {
  usePageMeta(
    'DentalFlow | IA de gestão para clínicas odontológicas',
    'Assistente de IA que analisa dados da clínica e apoia o gestor com insights e alertas baseados nos dados reais.',
  )
  return <FeatureDetailPage content={featureDetailContents.ia} />
}
