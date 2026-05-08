import { useParams } from '@tanstack/react-router'

import { ClinicalRecordPrintContainer } from '../containers/ClinicalRecordPrintContainer'

export function ClinicalRecordPrintPage() {
  const { clinicalRecordId } = useParams({ from: '/app/prontuario/$clinicalRecordId/imprimir' })
  return <ClinicalRecordPrintContainer recordId={clinicalRecordId} />
}
