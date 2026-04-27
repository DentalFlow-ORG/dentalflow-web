const DAYS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

type DayOfWeekLabelProps = {
  day: number
  short?: boolean
}

export function DayOfWeekLabel({ day, short = false }: DayOfWeekLabelProps) {
  const label = DAYS[day] ?? '—'
  return <span>{short ? label.split('-')[0] : label}</span>
}
