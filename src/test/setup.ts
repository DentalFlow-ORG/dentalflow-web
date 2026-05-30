import '@testing-library/jest-dom/vitest'

// Radix UI uses pointer capture and scroll APIs that jsdom does not implement
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => {}
Element.prototype.releasePointerCapture = () => {}
Element.prototype.scrollIntoView = () => {}
