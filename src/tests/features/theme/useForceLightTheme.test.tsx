import { act } from '@testing-library/react'

import { useForceLightTheme } from '@/features/theme/useForceLightTheme'
import { render } from '@/test-utils/render-utils'

function ForceLightConsumer() {
  useForceLightTheme()
  return <div>content</div>
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('useForceLightTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('removes the dark class while mounted', async () => {
    document.documentElement.classList.add('dark')
    render(<ForceLightConsumer />)
    await flushMicrotasks()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('restores the saved dark preference on unmount', async () => {
    localStorage.setItem('dentalflow.theme', 'dark')
    const { unmount } = render(<ForceLightConsumer />)
    await flushMicrotasks()
    unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('restores light when no preference (or a non-dark one) was saved', async () => {
    localStorage.setItem('dentalflow.theme', 'light')
    const { unmount } = render(<ForceLightConsumer />)
    await flushMicrotasks()
    unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('does not crash when localStorage.getItem throws on unmount', async () => {
    const { unmount } = render(<ForceLightConsumer />)
    await flushMicrotasks()
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    expect(() => unmount()).not.toThrow()
    Storage.prototype.getItem = original
  })
})
