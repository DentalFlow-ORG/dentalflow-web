import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function PatientsFeaturePage() {
  usePageMeta(
    'DentalFlow | Gestão de pacientes para clínicas odontológicas',
    'Centralize o cadastro de pacientes, histórico de atendimentos e dados de contato em uma plataforma. Sem papel, sem planilha.',
  )
  return <FeatureDetailPage content={featureDetailContents.pacientes} />
}
