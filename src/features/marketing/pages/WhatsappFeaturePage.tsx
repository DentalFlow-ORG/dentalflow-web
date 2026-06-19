import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function WhatsappFeaturePage() {
  usePageMeta(
    'DentalFlow | WhatsApp e notificações para clínicas odontológicas',
    'Configure lembretes e confirmações de consulta via WhatsApp. Reduza faltas e retrabalho com automações estruturadas.',
  )
  return <FeatureDetailPage content={featureDetailContents.whatsapp} />
}
