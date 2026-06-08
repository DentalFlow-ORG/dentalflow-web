import type { FiscalProviderMode } from '../types/fiscal.types'

export const ENVIRONMENT_LABELS: Record<FiscalProviderMode, string> = {
  LOCAL: 'Local/Simulação',
  SANDBOX: 'Homologação',
  PRODUCTION: 'Produção',
}
