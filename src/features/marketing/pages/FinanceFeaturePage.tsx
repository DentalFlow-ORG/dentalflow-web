import { featureDetailContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureDetailPage } from './FeatureDetailPage'

export function FinanceFeaturePage() {
  usePageMeta(
    'DentalFlow | Gestão financeira para clínicas odontológicas',
    'Controle entradas, saídas e pagamentos das consultas. Fluxo de caixa organizado sem depender de planilhas.',
  )
  return <FeatureDetailPage content={featureDetailContents.financeiro} />
}
