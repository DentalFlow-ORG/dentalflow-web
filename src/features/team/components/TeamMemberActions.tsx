import { useState } from 'react'
import { KeyRound, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { MemberListItem } from '../types/team.types'

type TeamMemberActionsLayout = 'desktop' | 'mobile'

type TeamMemberActionsProps = {
  member: MemberListItem
  onEdit: () => void
  onPassword: () => void
  onDelete: () => void
  layout?: TeamMemberActionsLayout
}

export function TeamMemberActions({
  member,
  onEdit,
  onPassword,
  onDelete,
  layout = 'desktop',
}: TeamMemberActionsProps) {
  const [open, setOpen] = useState(false)
  const fullName = `${member.firstName} ${member.lastName}`

  if (layout === 'mobile') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <Button size="sm" variant="outline" className="w-full" onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar
        </Button>
        <Button size="sm" variant="ghost" className="w-full" onClick={onPassword}>
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Alterar senha
        </Button>
        <Button size="sm" variant="destructive" className="w-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Desativar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button size="xs" variant="outline" onClick={onEdit}>
        <Pencil aria-hidden="true" />
        Editar
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Mais ações para ${fullName}`}
            aria-haspopup="menu"
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 overflow-hidden py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
            onClick={() => {
              setOpen(false)
              onPassword()
            }}
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Alterar senha
          </button>
          <div className="mx-1 my-0.5 h-px bg-border" role="separator" />
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none dark:hover:bg-destructive/35 dark:focus:bg-destructive/35"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Desativar
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
