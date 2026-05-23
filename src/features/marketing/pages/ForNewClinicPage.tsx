import { roleContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { RolePage } from './RolePage'

export function ForNewClinicPage() {
  usePageMeta(
    'DentalFlow | Para clínicas odontológicas em abertura',
    'Comece organizado desde o primeiro atendimento. Agenda, pacientes, financeiro e equipe estruturados desde a abertura.',
  )
  return <RolePage content={roleContents['clinicas-em-abertura']} />
}
