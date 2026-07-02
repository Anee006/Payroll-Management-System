import { useState } from 'react'
import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const modules = [
  'Dashboard',
  'Employees',
  'Attendance',
  'Leave',
  'Payroll',
  'Departments',
  'Roles',
]

const actions = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'generate']
const roles = ['Admin', 'Manager', 'Employee']

function Permissions() {
  const [selectedRole, setSelectedRole] = useState('Admin')

  return (
    <DashboardLayout title="Permissions">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Permission Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure what each role can access. Backend persistence will be wired next.
          </p>
        </div>

        <Card>
          <div className="mb-6 flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                  selectedRole === role
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">
                    Module
                  </th>
                  {actions.map((action) => (
                    <th
                      key={action}
                      className="px-3 py-3 text-center font-semibold capitalize text-slate-500"
                    >
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((moduleName) => (
                  <tr key={moduleName} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {moduleName}
                    </td>
                    {actions.map((action) => (
                      <td key={action} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          disabled
                          checked={selectedRole === 'Admin'}
                          readOnly
                          className="h-4 w-4 rounded accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Static preview for {selectedRole}. Backend permission checks will replace this shell.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Permissions
