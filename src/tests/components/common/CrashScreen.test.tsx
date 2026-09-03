import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { CrashScreen } from '@/components/common/CrashScreen'

describe('CrashScreen', () => {
  it('renders the error heading and message', () => {
    render(<CrashScreen />)
    expect(screen.getByRole('heading', { name: 'Algo deu errado' })).toBeInTheDocument()
  })

  it('reloads the page when the button is clicked', async () => {
    const reloadSpy = vi.fn()
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadSpy },
      configurable: true,
      writable: true,
    })

    render(<CrashScreen />)
    await userEvent.click(screen.getByRole('button', { name: /recarregar página/i }))
    expect(reloadSpy).toHaveBeenCalledOnce()

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true,
    })
  })
})
