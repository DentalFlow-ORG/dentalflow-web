import { render } from '@/test-utils/render-utils'

import { OdontogramToothSvg } from '@/features/clinical-records/components/odontogram/OdontogramToothSvg'

describe('OdontogramToothSvg', () => {
  it.each([
    [11, 'incisor'],
    [13, 'canine'],
    [14, 'premolar'],
    [16, 'molar'],
  ])('renders the %s path for tooth %i (%s)', (toothNumber) => {
    const { container } = render(
      <OdontogramToothSvg toothNumber={toothNumber} fill="#fff" stroke="#000" />,
    )
    expect(container.querySelector('svg path')).toBeInTheDocument()
  })

  it('renders occlusal-groove details for premolars and molars, none for incisors', () => {
    const { container: incisor } = render(
      <OdontogramToothSvg toothNumber={11} fill="#fff" stroke="#000" />,
    )
    expect(incisor.querySelectorAll('path')).toHaveLength(1)

    const { container: molar } = render(
      <OdontogramToothSvg toothNumber={16} fill="#fff" stroke="#000" />,
    )
    expect(molar.querySelectorAll('path')).toHaveLength(2)
  })

  it('renders the canine-specific ridge detail', () => {
    const { container } = render(<OdontogramToothSvg toothNumber={13} fill="#fff" stroke="#000" />)
    expect(container.querySelectorAll('path')).toHaveLength(2)
  })

  it('rotates 180deg by default (upper arch) and not when lower is true', () => {
    const { container: upper } = render(
      <OdontogramToothSvg toothNumber={11} fill="#fff" stroke="#000" />,
    )
    expect(upper.querySelector('svg')).toHaveClass('rotate-180')

    const { container: lower } = render(
      <OdontogramToothSvg toothNumber={41} fill="#fff" stroke="#000" lower />,
    )
    expect(lower.querySelector('svg')).not.toHaveClass('rotate-180')
  })
})
