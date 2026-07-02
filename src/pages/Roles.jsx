import RoleCard from '../components/RoleCard'
import DashboardLayout from '../layouts/DashboardLayout'

const roles = [
  {
    id: 1,
    name: 'Admin',
    description:
      'Full access across payroll, employees, attendance, leaves, and settings.',
    permissionCount: 49,
    isProtected: true,
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manage team attendance, leave approvals, and team records.',
    permissionCount: 24,
    isProtected: true,
  },
  {
    id: 3,
    name: 'Employee',
    description: 'View personal attendance, leave, profile, and payslips.',
    permissionCount: 14,
    isProtected: true,
  },
]

function Roles() {
  return (
    <DashboardLayout title="Roles">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Role Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review default access groups before backend role management is connected.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Create Role
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              name={role.name}
              description={role.description}
              permissionCount={role.permissionCount}
              isProtected={role.isProtected}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Roles
