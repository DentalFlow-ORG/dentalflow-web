import type { StockProductStatus } from '../types/inventory.types'

export const STATUS_OPTIONS: { value: StockProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Em estoque' },
  { value: 'LOW', label: 'Baixo estoque' },
  { value: 'EMPTY', label: 'Sem estoque' },
  { value: 'EXPIRING', label: 'Vencendo' },
  { value: 'EXPIRED', label: 'Vencido' },
  { value: 'INACTIVE', label: 'Inativo' },
]
