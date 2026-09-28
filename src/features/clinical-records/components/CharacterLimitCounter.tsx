import { cn } from '@/lib/utils'

import { CHARACTER_COUNTER_THRESHOLD } from '../constants/clinical-record-limits'

type Props = {
  id?: string
  length: number
  maxLength: number
  className?: string
}

/**
 * Character counter for long clinical text fields. Stays hidden until the
 * field approaches its limit so short notes are not cluttered.
 */
export function CharacterLimitCounter({ id, length, maxLength, className }: Props) {
  if (length < maxLength * CHARACTER_COUNTER_THRESHOLD) return null

  const reachedLimit = length >= maxLength

  return (
    <>
      <p
        id={id}
        className={cn(
          'text-right text-[11px]',
          reachedLimit ? 'font-semibold text-destructive' : 'text-muted-foreground',
          className,
        )}
      >
        {length.toLocaleString('pt-BR')}/{maxLength.toLocaleString('pt-BR')} caracteres
        {reachedLimit && ' — limite atingido'}
      </p>
      <span role="status" className="sr-only">
        {reachedLimit ? 'Limite de caracteres atingido.' : 'Texto próximo do limite de caracteres.'}
      </span>
    </>
  )
}
