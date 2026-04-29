import { cn } from '@/lib/utils'

import { formatWeekDayHeader, isToday } from '../../utils/time'
import type { Appointment } from '../../types/scheduling.types'
import { AppointmentCard } from './AppointmentCard'

type DayColumnProps = {
  date: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
}

export function DayColumn({ date, appointments, onAppointmentClick }: DayColumnProps) {
  const today = isToday(date)
  const sortedAppointments = [...appointments].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )

  const { weekday, day: dayMonth } = formatWeekDayHeader(date)

  return (
    <div
      className={cn(
        'flex min-h-32 flex-col rounded-lg border shadow-sm transition hover:shadow-md',
        today
          ? 'border-primary/30 bg-blue-50/60 shadow-primary/5'
          : 'border-slate-200 bg-white shadow-slate-950/5',
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          'border-b px-2.5 py-2 text-center',
          today ? 'border-primary/20' : 'border-slate-200',
        )}
      >
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-wide',
            today ? 'text-primary' : 'text-slate-500',
          )}
        >
          {weekday}
        </p>
        <p
          className={cn(
            'mt-0.5 text-sm font-bold',
            today ? 'text-primary' : 'text-slate-900',
          )}
        >
          {dayMonth}
        </p>
      </div>

      {/* Appointments */}
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {sortedAppointments.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-300">—</p>
        ) : (
          sortedAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onClick={onAppointmentClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
