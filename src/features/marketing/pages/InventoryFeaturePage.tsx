import { usePageMeta } from '../hooks/usePageMeta'
import { featureDetailContents } from '../data/public-content'
import { FeatureDetailPage } from './FeatureDetailPage'

export function InventoryFeaturePage() {
  usePageMeta(
    'DentalFlow | Controle de estoque para clínicas odontológicas',
    'Acompanhe materiais e insumos com entradas, saídas e alertas de estoque mínimo. Gestão de estoque sem planilhas.',
  )
  return <FeatureDetailPage content={featureDetailContents.estoque} />
}
