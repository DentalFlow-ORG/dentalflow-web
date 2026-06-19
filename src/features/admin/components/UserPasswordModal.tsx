import { PasswordResetModal } from '@/components/common/PasswordResetModal'

import { updateAdminUserPassword } from '../services/admin-users.service'

type Props = {
  open: boolean
  userId: string
  userName: string
  onClose: () => void
  onSuccess: () => void
}

export function UserPasswordModal({ open, userId, userName, onClose, onSuccess }: Props) {
  return (
    <PasswordResetModal
      open={open}
      subjectName={userName}
      formId="password-form"
      newPasswordId="new-password"
      confirmPasswordId="confirm-password"
      onClose={onClose}
      onSubmit={(password) => updateAdminUserPassword(userId, { password })}
      onSuccess={onSuccess}
    />
  )
}
