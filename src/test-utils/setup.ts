import '@testing-library/jest-dom/vitest'

// Radix UI uses pointer capture and scroll APIs that jsdom does not implement
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => {}
Element.prototype.releasePointerCapture = () => {}
Element.prototype.scrollIntoView = () => {}

// jsdom does not implement AnimationEvent, so React never dispatches
// onAnimationEnd/onAnimationStart. Define the standard class (jsdom does
// deliver the event once it exists) so components that clean up after a CSS
// animation can be tested through their own handler rather than a stub.
if (typeof globalThis.AnimationEvent === 'undefined') {
  class AnimationEventPolyfill extends Event {
    animationName: string
    elapsedTime: number
    pseudoElement: string

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init)
      this.animationName = init.animationName ?? ''
      this.elapsedTime = init.elapsedTime ?? 0
      this.pseudoElement = init.pseudoElement ?? ''
    }
  }
  globalThis.AnimationEvent = AnimationEventPolyfill as unknown as typeof AnimationEvent
}
