import { roleContents } from '../data/public-content'
import { usePageMeta } from '../hooks/usePageMeta'
import { RolePage } from './RolePage'

export function ForManagerPage() {
  usePageMeta(
    'DentalFlow | Para gestores e administradores de clínicas',
    'Financeiro, relatórios, estoque e IA de gestão em uma plataforma. Visão completa para quem decide.',
  )
  return <RolePage content={roleContents.gestores} />
}
