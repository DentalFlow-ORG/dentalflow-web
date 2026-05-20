import { roleContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { RolePage } from './RolePage'

export function ForSecretaryPage() {
  usePageMeta(
    'DentalFlow | Para secretárias e recepcionistas de clínicas',
    'Agenda organizada, confirmações automáticas e pacientes centralizados. O DentalFlow apoia a rotina da recepção.',
  )
  return <RolePage content={roleContents.secretaria} />
}
