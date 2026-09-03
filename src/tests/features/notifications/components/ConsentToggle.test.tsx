import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ConsentToggle } from '@/features/notifications/components/ConsentToggle'

describe('ConsentToggle', () => {
  it('reflects the checked state', () => {
    render(<ConsentToggle checked onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('reflects the unchecked state', () => {
    render(<ConsentToggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('calls onChange with the new value', async () => {
    const onChange = vi.fn()
    render(<ConsentToggle checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled is true', () => {
    render(<ConsentToggle checked={false} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
