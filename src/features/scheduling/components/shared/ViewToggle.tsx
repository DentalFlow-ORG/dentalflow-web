import { CalendarDays, List } from 'lucide-react'

import { Button } from '@/components/ui/button'

type View = 'calendar' | 'table'

interface ViewToggleProps {
  view: View
  onChange: (view: View) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant={view === 'calendar' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => onChange('calendar')}
        title="Calendário semanal"
      >
        <CalendarDays className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={view === 'table' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => onChange('table')}
        title="Lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
