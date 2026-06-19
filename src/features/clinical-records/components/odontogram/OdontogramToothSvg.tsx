import { cn } from '@/lib/utils'

import { type ToothKind, getToothKind } from '../../utils/odontogram-status-utils'

const TOOTH_PATHS: Record<ToothKind, string> = {
  incisor:
    'M22 5.2c-5.3 0-10.4 3.7-10.4 10.8 0 5.9 3.8 10.9 4.6 18.5.7 6.6 1.7 15.5 5.8 15.5s5.1-8.9 5.8-15.5c.8-7.6 4.6-12.6 4.6-18.5 0-7.1-5.1-10.8-10.4-10.8Z',
  canine:
    'M22 5.1c-5.4 0-10.5 3.8-10.5 10.9 0 5.9 3.8 10.2 5 17.5 1 6.4 2.2 17.6 5.5 17.6s4.5-11.2 5.5-17.6c1.2-7.3 5-11.6 5-17.5 0-7.1-5.1-10.9-10.5-10.9Z',
  premolar:
    'M15.4 6.2c-4.8 1.7-7.1 6.3-6 11.6 1.1 5.3 5.3 9.3 6.2 16 .9 6.3 1.6 15.7 5.3 16.2 3.1.4 4.8-7.1 5.8-14.8 1.4 7.3 3.7 14.1 6.5 12.8 3.4-1.5 3.3-10.3 3.8-16.3.5-6.4 4.1-10.8 4.9-16 .8-5.3-2-9.4-7-10.6-4.2-1-7 .8-10 .8-3.1 0-5.4-1.2-9.5.3Z',
  molar:
    'M13.2 6.4C8.6 8 6.5 12.2 7.4 17.2c1.1 5.6 5 10.5 5.4 16.7.4 6.4.2 13.7 3.8 15.4 3.3 1.6 6.2-5.4 8-13.1 2.1 7.6 5.4 14.3 8.5 12.3 3.4-2.2 2.9-9.3 3.3-15.7.4-6.2 4.7-10.2 5.7-15.7.9-5.1-1.4-9.2-6.1-10.8-4.3-1.5-7.4.4-11.3.4-4.1 0-7.1-1.8-11.5-.3Z',
}

type Props = {
  toothNumber: number
  fill: string
  stroke: string
  lower?: boolean
  className?: string
}

export function OdontogramToothSvg({ toothNumber, fill, stroke, lower = false, className }: Props) {
  const kind = getToothKind(toothNumber)

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 56"
      className={cn('h-full w-full overflow-visible', !lower && 'rotate-180', className)}
    >
      <path
        d={TOOTH_PATHS[kind]}
        fill={fill}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {(kind === 'premolar' || kind === 'molar') && (
        <path
          d={
            kind === 'molar'
              ? 'M15 20.4c3.6 2 10.4 2 14 0M16.8 27c2.8 1.5 7.6 1.5 10.4 0'
              : 'M17 21c2.8 1.6 7.2 1.6 10 0'
          }
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
      )}
      {kind === 'canine' && (
        <path
          d="M18.5 20.5c2.1 1.1 4.9 1.1 7 0"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth="1.1"
        />
      )}
    </svg>
  )
}
