import { vi } from 'vitest'

export let latestRecorder: FakeMediaRecorder | null = null

export function resetMediaRecorder() {
  latestRecorder = null
  FakeMediaRecorder.isTypeSupported.mockReset().mockReturnValue(true)
}

export class FakeMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((event: { data: Blob; size: number }) => void) | null = null
  onstop: (() => void) | null = null
  mimeType = 'audio/webm'
  static isTypeSupported = vi.fn((_type: string) => true)

  constructor() {
    latestRecorder = this
  }

  start = vi.fn(() => {
    this.state = 'recording'
  })
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
    this.ondataavailable?.({ data: blob, size: blob.size })
    this.onstop?.()
  })
}

export class FakeFileReader {
  result: string | ArrayBuffer | null = 'data:audio/webm;base64,ZmFrZQ=='
  onloadend: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    queueMicrotask(() => this.onloadend?.())
  }
}
