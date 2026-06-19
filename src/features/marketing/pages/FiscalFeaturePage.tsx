import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function FiscalFeaturePage() {
  usePageMeta(
    'DentalFlow | Controle fiscal para clínicas odontológicas',
    'Organize rascunhos de notas fiscais e vincule consultas a registros fiscais. Controle interno organizado, sem planilhas.',
  )
  return <FeatureDetailPage content={featureDetailContents['controle-fiscal']} />
}
