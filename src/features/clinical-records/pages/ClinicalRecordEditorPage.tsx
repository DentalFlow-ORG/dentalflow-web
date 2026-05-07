import { useParams } from '@tanstack/react-router'

import { ClinicalRecordEditorContainer } from '../containers/ClinicalRecordEditorContainer'

export function ClinicalRecordEditorPage() {
  const { clinicalRecordId } = useParams({ from: '/app/prontuario/$clinicalRecordId' })
  return <ClinicalRecordEditorContainer recordId={clinicalRecordId} />
}
