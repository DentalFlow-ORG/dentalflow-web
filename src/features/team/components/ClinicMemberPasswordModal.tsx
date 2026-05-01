import { PasswordResetModal } from '@/components/common/PasswordResetModal'

import { updateClinicMemberPassword } from '../services/team.service'

type ClinicMemberPasswordModalProps = {
  open: boolean
  memberId: string
  memberName: string
  onClose: () => void
  onSuccess: () => void
}

export function ClinicMemberPasswordModal({
  open,
  memberId,
  memberName,
  onClose,
  onSuccess,
}: ClinicMemberPasswordModalProps) {
  return (
    <PasswordResetModal
      open={open}
      subjectName={memberName}
      formId="member-password-form"
      newPasswordId="memberNewPassword"
      confirmPasswordId="memberConfirmPassword"
      onClose={onClose}
      onSubmit={(password) => updateClinicMemberPassword(memberId, { password })}
      onSuccess={onSuccess}
    />
  )
}
