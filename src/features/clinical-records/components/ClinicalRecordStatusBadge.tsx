import { cn } from '@/lib/utils'

import type { ClinicalRecordStatus } from '../types/clinical-record.types'
import {
  CLINICAL_RECORD_STATUS_COLOR,
  CLINICAL_RECORD_STATUS_LABEL,
} from '../utils/clinical-record-labels'

type Props = {
  status: ClinicalRecordStatus
  className?: string
}

export function ClinicalRecordStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        CLINICAL_RECORD_STATUS_COLOR[status],
        className,
      )}
    >
      {CLINICAL_RECORD_STATUS_LABEL[status]}
    </span>
  )
}
