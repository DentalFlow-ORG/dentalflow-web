import { Loader2, Search, UserRound } from 'lucide-react'
import { useState } from 'react'

import { FormField, TextInput } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { PATIENT_SEARCH_MAX_LENGTH } from '@/features/patients/constants/patient-search'
import type { PatientSummary } from '@/features/patients/types/patients.types'
import { formatPhoneBR } from '@/lib/field-formatters'

import { usePatientSearch } from '../../hooks/usePatientSearch'

type PatientPickerProps = {
  selected: PatientSummary | null
  disabled?: boolean
  error?: string | null
  onSelect: (patient: PatientSummary) => void
  onClear: () => void
}

/**
 * Explicit selection of an existing Patient. Identity comes only from the
 * chosen row's patientId — never from matching name, e-mail or phone.
 */
export function PatientPicker({
  selected,
  disabled,
  error,
  onSelect,
  onClear,
}: PatientPickerProps) {
  const [query, setQuery] = useState('')
  const { results, status } = usePatientSearch(query, !selected)

  if (selected) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{selected.patientName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[
                selected.patientEmail,
                selected.patientPhone ? formatPhoneBR(selected.patientPhone) : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Sem contato cadastrado'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            setQuery('')
            onClear()
          }}
        >
          Trocar paciente
        </Button>
      </div>
    )
  }

  return (
    <FormField label="Buscar paciente" htmlFor="patientSearchQuery" error={error}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <TextInput
          id="patientSearchQuery"
          type="search"
          autoComplete="off"
          maxLength={PATIENT_SEARCH_MAX_LENGTH}
          disabled={disabled}
          placeholder="Buscar paciente por nome ou e-mail"
          value={query}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'patientSearchQuery-error' : undefined}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>
      <PatientSearchResults
        query={query}
        status={status}
        results={results}
        disabled={disabled}
        onSelect={onSelect}
      />
    </FormField>
  )
}

function PatientSearchResults({
  query,
  status,
  results,
  disabled,
  onSelect,
}: {
  query: string
  status: ReturnType<typeof usePatientSearch>['status']
  results: PatientSummary[]
  disabled?: boolean
  onSelect: (patient: PatientSummary) => void
}) {
  if (!query.trim()) {
    return (
      <p className="text-xs text-muted-foreground">
        Digite o nome ou e-mail para encontrar um paciente já cadastrado.
      </p>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Buscando pacientes...
      </p>
    )
  }

  if (status === 'error') {
    return (
      <p className="text-xs text-destructive" role="alert">
        Não foi possível buscar pacientes. Tente novamente.
      </p>
    )
  }

  if (results.length === 0) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        Nenhum paciente encontrado. Use &quot;Novo paciente&quot; para cadastrar.
      </p>
    )
  }

  return (
    <ul
      aria-label="Pacientes encontrados"
      className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border"
    >
      {results.map((patient) => (
        <li key={patient.patientId}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(patient)}
            className="flex w-full flex-col items-start px-3 py-2 text-left transition hover:bg-primary/5 focus:bg-primary/5 focus:outline-none disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium text-foreground">{patient.patientName}</span>
            <span className="text-xs text-muted-foreground">
              {[
                patient.patientEmail,
                patient.patientPhone ? formatPhoneBR(patient.patientPhone) : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Sem contato cadastrado'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
