import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function AgendaFeaturePage() {
  usePageMeta(
    'DentalFlow | Agenda para clínicas odontológicas',
    'Gerencie consultas por dentista, horário e status. Integração com Google Calendar e lembretes automáticos via WhatsApp.',
  )
  return <FeatureDetailPage content={featureDetailContents.agenda} />
}
