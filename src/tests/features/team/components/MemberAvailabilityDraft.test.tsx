import { render, screen, userEvent } from '@/test-utils/render-utils'

import { MemberAvailabilityDraft } from '@/features/team/components/MemberAvailabilityDraft'
import type { CreateAvailabilityDto } from '@/features/scheduling/types/scheduling.types'

const SLOT: CreateAvailabilityDto = {
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '12:00',
  isActive: true,
}

describe('MemberAvailabilityDraft', () => {
  it('gives the remove action an accessible name and removes the selected slot', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<MemberAvailabilityDraft value={[SLOT]} onChange={onChange} />)

    await user.click(
      screen.getByRole('button', {
        name: /remover horário de segunda-feira das 08:00 às 12:00/i,
      }),
    )

    expect(onChange).toHaveBeenCalledWith([])
  })
})
