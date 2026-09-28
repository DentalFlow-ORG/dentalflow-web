import userEvent from '@testing-library/user-event'

import { act, fireEvent, render, screen } from '@/test-utils/render-utils'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing meaningful when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Excluir paciente"
        description="Esta ação não pode ser desfeita."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByText('Excluir paciente')).not.toBeInTheDocument()
  })

  it('renders title, description and subject when open', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir paciente"
        description="Esta ação não pode ser desfeita."
        subject="João da Silva"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Excluir paciente')).toBeInTheDocument()
    expect(screen.getByText('Esta ação não pode ser desfeita.')).toBeInTheDocument()
    expect(screen.getByText('João da Silva')).toBeInTheDocument()
  })

  it('renders default confirm/cancel labels and calls the handlers', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledOnce()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders custom confirm/cancel labels', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        confirmLabel="Sim, excluir"
        cancelLabel="Não"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Sim, excluir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument()
  })

  it('shows a loading state and disables both buttons while confirming', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        isConfirming
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /aguarde/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('disables the confirm button when confirmDisabled is true', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        confirmDisabled
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  })

  it('renders the warning tone', () => {
    render(
      <ConfirmDialog
        open
        title="Atenção"
        description="Isso pode ter efeitos."
        tone="warning"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('renders children content between description and footer', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      >
        <p>Detalhe extra</p>
      </ConfirmDialog>,
    )
    expect(screen.getByText('Detalhe extra')).toBeInTheDocument()
  })

  it('calls onCancel when the dialog is closed via onOpenChange (e.g. Escape)', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('ignores Escape while the action is confirming, keeping the pending state visible', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        isConfirming
        title="Excluir"
        description="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /aguarde/i })).toBeDisabled()
  })

  it('ignores clicks outside the dialog while the action is confirming', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        isConfirming
        title="Excluir"
        description="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    // Radix attaches its outside-pointer listener on the next tick.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    fireEvent.pointerDown(document.body)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel when clicking outside an idle dialog', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    // Radix attaches its outside-pointer listener on the next tick.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    fireEvent.pointerDown(document.body)
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
