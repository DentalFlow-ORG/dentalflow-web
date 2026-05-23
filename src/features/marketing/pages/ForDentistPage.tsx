import { roleContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { RolePage } from './RolePage'

export function ForDentistPage() {
  usePageMeta(
    'DentalFlow | Para dentistas',
    'Agenda do dia, prontuários digitais e histórico clínico de cada paciente. O DentalFlow organiza a rotina do dentista.',
  )
  return <RolePage content={roleContents.dentistas} />
}
