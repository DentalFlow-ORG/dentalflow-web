import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ReactivateProductDialog } from '@/features/inventory/components/ReactivateProductDialog'

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof ReactivateProductDialog>> = {},
) {
  return render(
    <ReactivateProductDialog
      open
      productName="Luva de Látex M"
      isReactivating={false}
      error={null}
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
      {...overrides}
    />,
  )
}

describe('ReactivateProductDialog', () => {
  it('renders nothing meaningful when closed', () => {
    renderDialog({ open: false })
    expect(screen.queryByText('Reativar produto')).not.toBeInTheDocument()
  })

  it('renders the product name in the confirmation message', () => {
    renderDialog()
    expect(screen.getByText('Luva de Látex M')).toBeInTheDocument()
  })

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn()
    renderDialog({ onConfirm })
    await userEvent.click(screen.getByRole('button', { name: 'Reativar produto' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancelar is clicked', async () => {
    const onCancel = vi.fn()
    renderDialog({ onCancel })
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows a loading state and disables both buttons while reactivating', () => {
    renderDialog({ isReactivating: true })
    expect(screen.getByRole('button', { name: /reativando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('shows the error message when present', () => {
    renderDialog({ error: 'Não foi possível reativar o produto.' })
    expect(screen.getByText('Não foi possível reativar o produto.')).toBeInTheDocument()
  })

  it('does not show an error block when there is none', () => {
    renderDialog()
    expect(screen.queryByText(/não foi possível/i)).not.toBeInTheDocument()
  })

  it('calls onCancel when closed via onOpenChange (e.g. Escape)', async () => {
    const onCancel = vi.fn()
    renderDialog({ onCancel })
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })
})
