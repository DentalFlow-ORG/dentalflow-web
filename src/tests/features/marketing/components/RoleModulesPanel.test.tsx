import { Calendar, FileText, Users } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { RoleModulesPanel } from '@/features/marketing/components/RoleModulesPanel'

const modules = ['Agenda', 'Prontuário', 'Pacientes']
const icons = [Calendar, FileText, Users]

describe('RoleModulesPanel', () => {
  it('names the role in the section heading', () => {
    render(<RoleModulesPanel modules={modules} moduleIcons={icons} roleLabel="Dentistas" />)
    expect(screen.getByRole('heading', { name: /dentistas/i })).toBeInTheDocument()
  })

  it('renders one tile per module', () => {
    render(<RoleModulesPanel modules={modules} moduleIcons={icons} roleLabel="Dentistas" />)
    for (const name of modules) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('uses the standard accent by default', () => {
    render(<RoleModulesPanel modules={modules} moduleIcons={icons} roleLabel="Dentistas" />)
    expect(screen.getByText('Agenda').closest('div')).not.toHaveClass('bg-emerald-50')
  })

  it('uses the emerald accent when requested', () => {
    render(
      <RoleModulesPanel
        modules={modules}
        moduleIcons={icons}
        roleLabel="Dentistas"
        accent="emerald"
      />,
    )
    expect(screen.getByText('Agenda').closest('div')).toHaveClass('bg-emerald-50')
  })

  it('skips modules that have no matching icon rather than rendering a broken tile', () => {
    render(
      <RoleModulesPanel
        modules={[...modules, 'Relatórios']}
        moduleIcons={icons}
        roleLabel="Dentistas"
      />,
    )
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.queryByText('Relatórios')).not.toBeInTheDocument()
  })
})
