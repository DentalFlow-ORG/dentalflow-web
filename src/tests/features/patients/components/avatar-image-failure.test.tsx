import { PatientAvatar } from '@/features/patients/components/PatientAvatar'
import { PatientAvatarWidget } from '@/features/patients/components/PatientAvatarWidget'
import { fireEvent, render, screen } from '@/test-utils/render-utils'

it.each([
  ['display', PatientAvatar],
  ['upload', PatientAvatarWidget],
] as const)(
  'recovers the %s avatar from a failed image and tries a replacement',
  (_kind, Avatar) => {
    const { container, rerender } = render(<Avatar name="Ana Lima" avatarUrl="broken" />)
    const image = container.querySelector('img')
    if (!image) throw new Error('Expected avatar image')
    fireEvent.error(image)
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(<Avatar name="Ana Lima" avatarUrl="replacement" />)
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'data:image/jpeg;base64,replacement',
    )
    expect(screen.queryByText('AL')).not.toBeInTheDocument()

    rerender(<Avatar name="Ana Lima" avatarUrl={null} />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  },
)
